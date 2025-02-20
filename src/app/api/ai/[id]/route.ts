import {
  generateChunks,
  generateSummary,
  getBookText,
  summarizeBook,
} from "@/lib/ai";
import { AiSummary, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import WebSocket from "ws";

const prisma = new PrismaClient();
let wss: WebSocketServer | null = null;

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

  if (record)
    return NextResponse.json({
      status: "record_found",
      bulletpoints: record.bulletPoints,
    });

  // Initialize WebSocket Server if not already running
  if (!wss) {
    wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws, req) => {
      const urlParams = new URLSearchParams(req.url?.substring(1));
      const gutenId = urlParams.get("gutenId");
      handleConnection(ws, Number(gutenId));
    });
  }

  return NextResponse.json({ status: "socket_available" });
}

const handleConnection = async (ws: WebSocket, gutenId: number) => {
  const bookText = await getBookText(Number(gutenId));
  const chunks = generateChunks(bookText);
  const partialSummaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const summary = await generateSummary(chunks[i]);
    partialSummaries.push(summary);
    let progress = Math.ceil((i / chunks.length) * 100);
    if (progress > 90) progress -= 2; // this to take into account the last request
    ws.send(JSON.stringify({ progress }));
  }

  const bulletpoints = await summarizeBook(partialSummaries);
  ws.send(
    JSON.stringify({
      progress: 100,
      bulletpoints,
    }),
  );

  await prisma.aiSummary.upsert({
    where: { gutenId },
    update: {},
    create: {
      gutenId,
      bulletPoints: bulletpoints,
    },
  });

  ws.close();
};
