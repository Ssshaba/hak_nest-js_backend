-- CreateTable
CREATE TABLE "Competency" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToCompetency" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Competency_text_key" ON "Competency"("text");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToCompetency_AB_unique" ON "_UserToCompetency"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToCompetency_B_index" ON "_UserToCompetency"("B");

-- AddForeignKey
ALTER TABLE "_UserToCompetency" ADD CONSTRAINT "_UserToCompetency_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToCompetency" ADD CONSTRAINT "_UserToCompetency_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
