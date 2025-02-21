import axios from "axios";
import { put } from "@vercel/blob";
import { JSDOM } from "jsdom";
import { BookMetadata } from "@/types/book";
import { Book, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    return {
      title: metadata["Title"] || "Unknown Title",
      author: metadata["Author"] || "Unknown Author",
      language: metadata["Language"] || "-",
      attributes: Object.entries(metadata)
        .map(([key, value]) => ({ key, value }))
        .filter(
          (item) =>
            !["Title", "Author", "Language", "Summary"].includes(item.key),
        ),
    };
  } catch (error) {
    console.log(error);
    throw new Error("failed_metadata");
  }
};

const storeBookText = async (record: Book) => {
  const filename = `book_${record.gutenId}.txt`;
  if (record.textUrl) return;

  const urls = [
    `https://www.gutenberg.org/files/${record.gutenId}/${record.gutenId}-0.txt`,
    `https://www.gutenberg.org/cache/epub/${record.gutenId}/pg${record.gutenId}.txt`,
  ];

  const getBookText = async (url: string): Promise<string | null> => {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error(
        `Failed to fetch from ${url} - Status code: ${response.status}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null; // Indicates the book wasn't found on this URL
        }
      }
      throw error; // Re-throw the error if it's not a 404
    }
  };

  try {
    let bookText: string | null = null;

    for (const url of urls) {
      bookText = await getBookText(url);
      if (bookText) {
        break; // Exit loop if successful
      }
    }

    if (!bookText) {
      throw new Error("Failed to fetch book text from all URLs.");
    }

    // Store in blob storage
    const meta = await put(filename, bookText, { access: "public" });
    record.textUrl = meta.downloadUrl;

    await prisma.book.update({
      where: { gutenId: record.gutenId },
      data: { textUrl: meta.downloadUrl },
    });
  } catch (error) {
    console.log(error);
    throw new Error("failed_text");
  }
};

const createNewBook = async (
  gutenId: number,
  metadata: BookMetadata,
): Promise<Book> => {
  return await prisma.book.upsert({
    where: { gutenId },
    update: {},
    create: {
      gutenId,
      title: metadata.title,
      author: metadata.author,
      language: metadata.language,
      attributes: metadata.attributes,
    },
  });
};
export { fetchBookMetadata, storeBookText, createNewBook };
