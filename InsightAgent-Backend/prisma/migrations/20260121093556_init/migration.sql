-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableMetadata" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "columns" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TableMetadata_projectId_idx" ON "TableMetadata"("projectId");

-- AddForeignKey
ALTER TABLE "TableMetadata" ADD CONSTRAINT "TableMetadata_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
