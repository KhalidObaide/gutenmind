import { inngest } from "@/inngest/client";
import { AiSummary, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

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

  return NextResponse.json({ status: "not_found" });
}

export async function POST(
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

  const connectionId = uuidv4();
  await inngest.send({
    name: "ai/book-summarize",
    data: { gutenId, connectionId },
  });

  return NextResponse.json({ status: "background-job-started!", connectionId });
}
