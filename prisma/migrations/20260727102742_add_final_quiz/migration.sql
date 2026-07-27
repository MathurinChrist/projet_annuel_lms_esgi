-- CreateTable
CREATE TABLE "FinalQuizQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "FinalQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalQuizOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "FinalQuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinalQuizQuestion_courseId_idx" ON "FinalQuizQuestion"("courseId");

-- AddForeignKey
ALTER TABLE "FinalQuizQuestion" ADD CONSTRAINT "FinalQuizQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalQuizOption" ADD CONSTRAINT "FinalQuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FinalQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
