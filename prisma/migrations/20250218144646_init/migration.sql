-- CreateTable
CREATE TABLE "Book" (
    "gutenId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("gutenId")
);
