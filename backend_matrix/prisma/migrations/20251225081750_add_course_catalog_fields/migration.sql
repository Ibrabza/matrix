-- Add categoryId and instructorName to Course
ALTER TABLE "Course" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Course" ADD COLUMN "instructorName" TEXT;
CREATE INDEX IF NOT EXISTS "Course_categoryId_idx" ON "Course"("categoryId");
