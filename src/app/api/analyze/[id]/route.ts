import { NextResponse } from "next/server";
import { Book, PrismaClient } from "@prisma/client";
import {
  createNewBook,
  fetchBookMetadata,
  storeBookText,
} from "@/services/bookService";
import { customErr } from "@/lib/utils";

const prisma = new PrismaClient();

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

  let record = (await prisma.book.findFirst({
    where: { gutenId },
  })) as Book;

  if (!record) {
    try {
      const metadata = await fetchBookMetadata(gutenId);
      record = await createNewBook(gutenId, metadata);
      await storeBookText(record);
    } catch (err) {
      if (err instanceof Error) {
        const errorMessages: Record<string, string> = {
          failed_metadata:
            "Failed to fetch book metadata. Please try again later.",
          failed_text: "Failed to fetch book text. Please try again later.",
          failed_record:
            "Failed to create book record. Please try again later.",
        };

        const errorMessage =
          errorMessages[err.message] ||
          "Something went wrong. Please try again later.";

        return NextResponse.json(customErr(err.message, errorMessage), {
          status: 503,
        });
      } else {
        return NextResponse.json(
          customErr("Unknown error", "An unexpected error occurred."),
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json(record);
}
