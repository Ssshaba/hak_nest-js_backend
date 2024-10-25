-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'SPECIALIST', 'GUEST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INTERNSHIP', 'PRACTICE', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('INPROGRESS', 'SUCCESSCOMPLETED', 'BADCOMPELTED');

-- CreateEnum
CREATE TYPE "StatusesForProject" AS ENUM ('COMPLETED', 'INPROGRESS', 'NOTSTARTED', 'CHECK', 'CANCEL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOTSTARTED', 'INPROGRESS', 'BLOCKED', 'COMPLETED', 'VERIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SPECIALIST',
    "login" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "telegram" TEXT,
    "direction" TEXT,
    "position" TEXT,
    "status" "UserStatus" DEFAULT 'PRACTICE',
    "study_group" TEXT,
    "plans" TEXT,
    "about" TEXT,
    "portfolio" TEXT,
    "note" TEXT,
    "inn" TEXT,
    "rate" INTEGER,
    "snils" TEXT,
    "birthday" TEXT,
    "passport_data" TEXT,
    "registration_address" TEXT,
    "living_address" TEXT,
    "requisites" TEXT,
    "npd_reference" TEXT,
    "projectId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "owner_id" INTEGER,
    "director" TEXT,
    "customer" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "contact_data" TEXT NOT NULL,
    "description" TEXT,
    "service_name" TEXT,
    "document_number" INTEGER NOT NULL DEFAULT 1,
    "contract" TEXT,
    "contract_date" TIMESTAMP(3),
    "technical_task" TEXT,
    "comment" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "organization_id" INTEGER,
    "status" "StatusesForProject" NOT NULL DEFAULT 'NOTSTARTED',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "project_id" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewer_id" INTEGER,
    "executor_id" INTEGER,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOTSTARTED',
    "hours" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToProject_AB_unique" ON "_UserToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToProject_B_index" ON "_UserToProject"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_executor_id_fkey" FOREIGN KEY ("executor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToProject" ADD CONSTRAINT "_UserToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToProject" ADD CONSTRAINT "_UserToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
