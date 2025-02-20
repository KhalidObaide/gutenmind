import { PrismaClient } from "@prisma/client";
import axios from "axios";

const URL = "https://api.groq.com/openai/v1/chat/completions";
const CHUNK_SIZE = 16348; // Safe chunk size to avoid exceeding limits

const prisma = new PrismaClient();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Payload {
  model: string;
  messages: ChatMessage[];
  response_format?: { type: "json_object" };
}

const getBookText = async (gutenId: number): Promise<string> => {
  const record = await prisma.book.findFirst({ where: { gutenId } });
  if (!record) throw new Error("Cannot find the book record");
  const response = await axios.get(record.textUrl);
  return response.data;
};

const generateSummary = async (
  text: string,
  jsonResponse = false,
): Promise<string> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  };

  const payload: Payload = {
    model: "llama3-8b-8192",
    messages: [
      { role: "user", content: text },
      { role: "user", content: "Summarize this text concisely." },
    ],
  };

  // Add response format only if jsonResponse is true
  if (jsonResponse) {
    payload.response_format = { type: "json_object" };
  }

  while (true) {
    try {
      const response = await axios.post(URL, payload, { headers });
      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          const retryAfter = parseInt(
            error.response.headers["Retry-After"] || "5",
            10,
          );
          console.log(
            `\nRate limit hit! Waiting ${retryAfter} seconds before retrying...\n`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
        }
      }
      console.error(error);
      throw new Error("failed_generate_summary");
    }
  }
};

const generateChunks = (bookText: string): string[] => {
  const chunks = [];
  for (let i = 0; i < bookText.length; i += CHUNK_SIZE) {
    chunks.push(bookText.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
};

const summarizeBook = async (partialSummaries: string[]): Promise<string[]> => {
  const finalSummaryPrompt = `${partialSummaries.join("\n")}\n\nSummarize this entire book in just 5 bullet points. Give me a JSON object with a key 'bulletpoints' that holds an array of 5 strings.`;
  const summary = await generateSummary(finalSummaryPrompt, true);
  return JSON.parse(summary).bulletpoints;
};

export { getBookText, generateChunks, generateSummary, summarizeBook };
