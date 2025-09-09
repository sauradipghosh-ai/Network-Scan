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

-- CreateIndex
CREATE INDEX "scans_ip_idx" ON "public"."scans"("ip");

-- CreateIndex
CREATE INDEX "scans_scanDate_idx" ON "public"."scans"("scanDate");

-- CreateIndex
CREATE INDEX "scans_ip_scanDate_idx" ON "public"."scans"("ip", "scanDate");

-- CreateIndex
CREATE INDEX "Port_port_idx" ON "public"."Port"("port");

-- CreateIndex
CREATE INDEX "Port_protocol_idx" ON "public"."Port"("protocol");

-- CreateIndex
CREATE INDEX "Port_scanId_idx" ON "public"."Port"("scanId");

-- CreateIndex
CREATE INDEX "Port_port_protocol_idx" ON "public"."Port"("port", "protocol");

-- CreateIndex
CREATE INDEX "Port_port_scanId_idx" ON "public"."Port"("port", "scanId");

-- AddForeignKey
ALTER TABLE "public"."Port" ADD CONSTRAINT "Port_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "public"."scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
