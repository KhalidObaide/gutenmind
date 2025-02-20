-- CreateTable
CREATE TABLE "AiSummary" (
    "gutenId" INTEGER NOT NULL,
    "bulletPoints" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSummary_gutenId_key" ON "AiSummary"("gutenId");
