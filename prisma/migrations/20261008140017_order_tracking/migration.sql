-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: give every existing order a timeline. One row for "placed" and, if the order has
-- already moved on, one for its current status (dated by its last update). Only values that
-- existed before this migration are used, because a newly added enum value cannot be used in
-- the same transaction that adds it.
INSERT INTO "OrderStatusHistory" ("id", "orderId", "status", "note", "createdAt")
SELECT 'bf_p_' || "id", "id", 'PENDING', 'Order placed successfully', "createdAt" FROM "Order";

INSERT INTO "OrderStatusHistory" ("id", "orderId", "status", "note", "createdAt")
SELECT 'bf_c_' || "id", "id", "orderStatus", 'Status at the time tracking was introduced', "updatedAt"
FROM "Order" WHERE "orderStatus" <> 'PENDING';
