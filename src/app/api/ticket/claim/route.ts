import { ses } from './../../../services/ses';
import { updateOrder, updateOrderResponse } from './../../../lib/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicKey, validateEvent } from 'nostr-tools';
import {
  claimSchema,
  validateZapReceiptEmitter,
  validateZapRequest,
} from '@/app/lib/validation/claimSchema';

interface TicketClaimResponse {
  fullname: string;
  email: string;
  orderReferenceId: string;
  qty: number;
  totalMiliSats: number;
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { status: false, errors: 'Method not allowed' },
      { status: 405 }
    );
  }

  const body = await req.json();

  // Zod
  const result = claimSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: false, errors: result.error.errors },
      { status: 400 }
    );
  }

  const { fullname, email, zapReceipt } = result.data;

  // Validate zapReceipt
  const isValidEvent = validateEvent(zapReceipt);
  const isValidEmitter = validateZapReceiptEmitter(zapReceipt);

  if (!isValidEvent) {
    return NextResponse.json(
      { status: false, errors: 'Invalid zap receipt' },
      { status: 403 }
    );
  }

  if (!isValidEmitter) {
    return NextResponse.json(
      { status: false, errors: 'Invalid zap receipt emitter' },
      { status: 403 }
    );
  }

  // Validate zapRequest
  const publicKey = getPublicKey(process.env.SIGNER_KEY!);
  const isValidZapRequest = validateZapRequest(zapReceipt, publicKey);

  if (!isValidZapRequest) {
    return NextResponse.json(
      { status: false, errors: 'Invalid zapRequest' },
      { status: 403 }
    );
  }

  // Prisma
  const updateOrderResponse: updateOrderResponse = await updateOrder(
    fullname,
    email,
    zapReceipt
  );

  // AWS SES
  try {
    await ses.sendEmailOrder(email, updateOrderResponse.referenceId);
  } catch (error) {
    return NextResponse.json({ status: false, errors: error }, { status: 500 });
  }

  // Response
  const response: TicketClaimResponse = {
    fullname,
    email,
    orderReferenceId: updateOrderResponse.referenceId,
    qty: updateOrderResponse.qty,
    totalMiliSats: updateOrderResponse.totalMiliSats,
  };

  return NextResponse.json({
    status: true,
    data: response,
  });
}
