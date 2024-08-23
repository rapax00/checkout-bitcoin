-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "totalMiliSats" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "checkIn" BOOLEAN NOT NULL DEFAULT false,
    "zapReceiptId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_referenceId_key" ON "Order"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_zapReceiptId_key" ON "Order"("zapReceiptId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
