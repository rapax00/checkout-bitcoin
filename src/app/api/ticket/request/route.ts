import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import signer from "@/app/services/signer";
import { EventTemplate, NostrEvent, UnsignedEvent } from "nostr-tools";
import { generateZapRequest } from "@/app/services/nostr";
import { generateInvoice, getCallbackUrlFromWalias } from "@/app/services/ln";
import { createOrder, CreateOrderResponse } from "@/app/lib/utils/prisma";

const ticketSchema = z.object({
  fullname: z.string().min(3, { message: "Fullname is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  qty: z.number().int().lt(1000).positive({ message: "Qty Must be a number" }),
});

interface RequestTicketResponse {
  pr: string;
  orderReferenceId: string;
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
  const orderResponse: CreateOrderResponse = await createOrder(
    fullname,
    email,
    qty
  );

  // Zap Request
  const unsignedZapRequest: EventTemplate = generateZapRequest(
    orderResponse.referenceId,
    orderResponse.totalSats
  );
  const zapRequest: EventTemplate = signer.signEvent(unsignedZapRequest);

  const posWalias = process.env.POS_WALIAS!;
  const callbackUrl = await getCallbackUrlFromWalias(posWalias);

  const invoice = await generateInvoice(
    callbackUrl,
    orderResponse.totalSats,
    zapRequest
  );

  const response: RequestTicketResponse = {
    pr: invoice,
    orderReferenceId: orderResponse.referenceId,
    qty,
    total: orderResponse.totalSats,
  };

  return NextResponse.json({
    message: "User registered successfully",
    data: response,
  });
}
