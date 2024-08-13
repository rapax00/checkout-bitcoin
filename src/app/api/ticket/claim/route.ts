import { updateOrder, updateOrderResponse } from "./../../../lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getPublicKey, validateEvent } from "nostr-tools";
import {
  claimSchema,
  validateZapReceiptEmitter,
  validateZapRequest,
} from "@/app/lib/validation/claimSchema";

interface TicketClaimResponse {
  fullname: string;
  email: string;
  orderReferenceId: string;
  qty: number;
  totalMiliSats: number;
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ errors: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json();

  // Zod
  const result = claimSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.errors }, { status: 400 });
  }

  const { fullname, email, zapReceipt } = result.data;

  // Validate zapReceipt
  const isValidEvent = validateEvent(zapReceipt);
  const isValidEmitter = validateZapReceiptEmitter(zapReceipt);

  if (!isValidEvent) {
    return NextResponse.json(
      { errors: "Invalid zap receipt" },
      { status: 403 }
    );
  }

  if (!isValidEmitter) {
    return NextResponse.json(
      { errors: "Invalid zap receipt emitter" },
      { status: 403 }
    );
  }

  // Validate zapRequest
  const publicKey = getPublicKey(
    Uint8Array.from(Buffer.from(process.env.SIGNER_PRIVATE_KEY!, "hex"))
  );
  const isValidZapRequest = validateZapRequest(zapReceipt, publicKey);

  if (!isValidZapRequest) {
    return NextResponse.json({ errors: "Invalid zapRequest" }, { status: 403 });
  }

  // Prisma
  const updateOrderResponse: updateOrderResponse = await updateOrder(
    fullname,
    email,
    zapReceipt
  );

  // Response
  const response: TicketClaimResponse = {
    fullname,
    email,
    orderReferenceId: updateOrderResponse.referenceId,
    qty: updateOrderResponse.qty,
    totalMiliSats: updateOrderResponse.totalMiliSats,
  };

  return NextResponse.json({
    message: "User registered successfully",
    data: response,
  });
}
