import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TICKET_PRICE = 1000;

const ticketSchema = z.object({
  fullname: z.string().min(3, { message: "Fullname is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  qty: z.number().int().lt(1000).positive({ message: "Qty Must be a number" }),
});

interface RequestTicketResponse {
  pr: string;
  orderId: string;
  qty: number;
  total: number;
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ errors: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json();
  const result = ticketSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.errors }, { status: 400 });
  }

  const { fullname, email, qty } = result.data;

  // Create order in prisma

  // Create zapRequest -> include orderId

  // Calculate ticket price using yadio API
  const orderTotal = qty * TICKET_PRICE;

  const response: RequestTicketResponse = {
    pr: "lnbc1sd123213213123",
    orderId: "432342423432423423423424234234",
    qty,
    total: orderTotal,
  };

  return NextResponse.json({
    message: "User registered successfully",
    data: response,
  });
}
