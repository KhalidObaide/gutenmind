import axios from "axios";
import { put, head } from "@vercel/blob";
import { JSDOM } from "jsdom";
import { BookMetadata } from "@/types/book";
import { Book, PrismaClient } from "@prisma/client";

const fetchBookMetadata = async (gutenId: number): Promise<BookMetadata> => {
  const metadataUrl = `https://www.gutenberg.org/ebooks/${gutenId}`;
  try {
    const response = await axios.get(metadataUrl);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const table = document.querySelector("table.bibrec");
    if (!table) {
      throw new Error("failed_metadata");
    }

    const metadata: Record<string, string> = {};
    Array.from(table.querySelectorAll("tbody tr")).forEach((tr) => {
      const row = tr as HTMLTableRowElement; // Explicitly cast to HTMLTableRowElement
      const th = row.querySelector("th");
      const td = row.querySelector("td");

      if (th?.textContent && td?.textContent) {
        metadata[th.textContent.trim()] = td.textContent.trim();
      }
    });
    console.log(metadata);

    return {
      title: metadata["Title"] || "Unknown Title",
      author: metadata["Author"] || "Unknown Author",
      language: metadata["Language"] || "-",
      publishDate: new Date(1200, 12, 21),
    };
  } catch (error) {
    console.log(error);
    throw new Error("failed_metadata");
  }
};

const storeBookText = async (gutenId: number) => {
  const filename = `book_${gutenId}.txt`;
  try {
    await head(filename); // already_exists, return here
    return;
  } catch { } // not_found, continue to create it

  try {
    // Fetch the txt file from Gutenberg using axios
    const contentUrl = `https://www.gutenberg.org/files/${gutenId}/${gutenId}-0.txt`;
    const response = await axios.get(contentUrl);
    if (response.status !== 200) {
      throw new Error("failed_text");
    }
    const bookText = response.data;

    // store in blob storage
    await put(filename, bookText, { access: "public" });
  } catch (error) {
    console.log(error);
    throw new Error("failed_text");
  }
};

const createNewBook = async (
  gutenId: number,
  metadata: BookMetadata,
): Promise<Book> => {
  const prisma = new PrismaClient();
  return await prisma.book.upsert({
    where: { gutenId },
    update: {},
    create: {
      gutenId,
      title: metadata.title,
      author: metadata.author,
      publishDate: new Date(1922, 12, 10),
      language: metadata.language,
    },
  });
};
export { fetchBookMetadata, storeBookText, createNewBook };
