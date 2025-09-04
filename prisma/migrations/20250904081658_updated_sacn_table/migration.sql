-- CreateTable
CREATE TABLE "public"."scans" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT,
    "status" TEXT NOT NULL,
    "scanDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Port" (
    "id" SERIAL NOT NULL,
    "port" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "version" TEXT,
    "scanId" INTEGER NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Port" ADD CONSTRAINT "Port_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "public"."scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
