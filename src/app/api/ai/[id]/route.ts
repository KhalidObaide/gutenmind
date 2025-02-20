import {
  generateChunks,
  generateSummary,
  getBookText,
  summarizeBook,
} from "@/lib/ai";
import { AiSummary, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import Pusher from "pusher";

const prisma = new PrismaClient();

export const config = {
  runtime: "edge", // Run as an Edge Function
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gutenId = Number(id);

  if (isNaN(gutenId)) {
    return NextResponse.json(
      { error: "Invalid ID. It must be a number." },
      { status: 400 },
    );
  }

  const record = (await prisma.aiSummary.findFirst({
    where: { gutenId },
  })) as AiSummary;

  if (record) {
    return NextResponse.json({
      status: "record_found",
      bulletpoints: record.bulletPoints,
    });
  }

  (async () => {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || "",
      secret: process.env.PUSHER_SECRET || "",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });

    const bookText = await getBookText(Number(gutenId));
    const chunks = generateChunks(bookText);
    const partialSummaries: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const summary = await generateSummary(chunks[i]);
        partialSummaries.push(summary);
        let progress = Math.ceil((i / chunks.length) * 100);
        if (progress > 90) progress -= 2; // this to take into account the last request
        pusher.trigger(gutenId.toString(), "progress-update", { progress });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "failed_generate_summary"
        ) {
          pusher.trigger(gutenId.toString(), "failed", {
            message: "Failed to generate summary for this book.",
          });
          return;
        }
      }
    }

    const bulletpoints = await summarizeBook(partialSummaries);
    pusher.trigger(gutenId.toString(), "progress-update", {
      progress: 100,
      bulletpoints,
    });

    await prisma.aiSummary.upsert({
      where: { gutenId },
      update: {},
      create: {
        gutenId,
        bulletPoints: bulletpoints,
      },
    });
  })();

  return NextResponse.json({ status: "channel_available" });
}
