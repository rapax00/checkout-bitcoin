import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ticketSchema = z.object({
  zapReceiptId: z.string().min(3, { message: "Fullname is required" }),
});

interface TicketClaimResponse {
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

  const {} = result.data;

  // Create order in prisma

  const response: TicketClaimResponse = {
    orderId: "432342423432423423423424234234",
    qty: 12,
    total: 1000,
  };

  return NextResponse.json({
    message: "User registered successfully",
    data: response,
  });
}
