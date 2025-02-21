import Pusher from "pusher";
import { inngest } from "./client";
import {
  generateChunks,
  generateSummary,
  getBookText,
  summarizeBook,
} from "@/lib/ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sendProgress = (
  pusher: Pusher,
  connectionId: string,
  index: number,
  total: number,
) => {
  const progress = Math.ceil((index / total) * 100);
  pusher.trigger(connectionId, "progress-update", { progress });
};

export const startBookSummarization = inngest.createFunction(
  { id: "book-summarize" },
  { event: "ai/book-summarize" },
  async ({ event, step }): Promise<string[]> => {
    const gutenId = event.data.gutenId;
    const connectionId = event.data.connectionId;

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || "",
      secret: process.env.PUSHER_SECRET || "",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });

    // Step 1: Fetch book text
    const bookText = await step.run("fetch-book-text", async () => {
      sendProgress(pusher, connectionId, 1, 100);
      return await getBookText(Number(gutenId));
    });

    // Step 2: Chunk the book text
    const chunks = await step.run("generate-chunks", async () => {
      sendProgress(pusher, connectionId, 2, 100);
      return generateChunks(bookText);
    });

    const partialSummaries: string[] = await step.run(
      `summarize-chunks`,
      async () => {
        const ps: string[] = [];
        // Step 3: Process each chunk
        for (let i = 0; i < chunks.length; i++) {
          try {
            const summary = await generateSummary(chunks[i]);
            ps.push(summary);
            sendProgress(pusher, connectionId, i + 1, chunks.length + 2);
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === "failed_generate_summary"
            ) {
              pusher.trigger(gutenId.toString(), "failed", {
                message: "Failed to generate summary for this book.",
              });
              return [];
            }
          }
        }

        return ps;
      },
    );

    // Step 4: Generate final bullet points
    const bulletpoints = await step.run("generate-final-summary", async () => {
      sendProgress(pusher, connectionId, chunks.length + 1, chunks.length + 2);
      return await summarizeBook(partialSummaries);
    });

    // Step 5: Save to database
    await step.run("save-summary-to-db", async () => {
      await prisma.aiSummary.upsert({
        where: { gutenId },
        update: { bulletPoints: bulletpoints },
        create: { gutenId, bulletPoints: bulletpoints },
      });

      pusher.trigger(connectionId, "progress-update", {
        progress: 100,
        bulletpoints,
      });
    });

    return bulletpoints;
  },
);
