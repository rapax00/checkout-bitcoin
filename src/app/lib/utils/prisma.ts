import { prisma } from "@/app/services/prismaClient";
import { Order, User } from "@prisma/client";
import { randomBytes } from "crypto";
import { calculateTicketPrice } from "./price";

export interface CreateOrderResponse {
  totalSats: number;
  referenceId: string;
}

export async function createOrder(
  fullname: string,
  email: string,
  qty: number
): Promise<CreateOrderResponse> {
  let user: User = await prisma.user.upsert({
    where: {
      fullname,
      email,
    },
    update: {},
    create: { fullname, email },
  });

  const referenceId: string = randomBytes(32).toString("hex");
  // const ticketPriceArs: number = parseInt(process.env.TICKET_PRICE_ARS!);
  //   const orderTotalSats = await calculateTicketPrice(qty, ticketPriceArs);
  const totalSats = 1000;

  const order: Order = await prisma.order.create({
    data: {
      referenceId,
      qty,
      totalSats,
      userId: user.id,
    },
  });

  const response: CreateOrderResponse = {
    totalSats,
    referenceId,
  };

  return response;
}
