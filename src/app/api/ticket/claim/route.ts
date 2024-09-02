import { ses } from '@/services/ses';
import { updateOrder, updateOrderResponse } from '../../../../lib/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicKey, validateEvent } from 'nostr-tools';
import {
  claimSchema,
  validateZapReceiptEmitter,
  validateZapRequest,
} from '@/lib/validation/claimSchema';
import { AppError } from '@/lib/errors/appError';

interface TicketClaimResponse {
  fullname: string;
  email: string;
  orderReferenceId: string;
  qty: number;
  totalMiliSats: number;
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const body = await req.json();

    // Zod
    const result = claimSchema.safeParse(body);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    const { fullname, email, zapReceipt } = result.data;

    // Validate zapReceipt
    const isValidEvent = validateEvent(zapReceipt);
    if (!isValidEvent) {
      throw new AppError('Invalid zap receipt', 403);
    }

    const isValidEmitter = validateZapReceiptEmitter(zapReceipt);
    if (!isValidEmitter) {
      throw new AppError('Invalid zap receipt emitter', 403);
    }

    // Validate zapRequest
    const publicKey = getPublicKey(
      Uint8Array.from(Buffer.from(process.env.SIGNER_KEY!, 'hex'))
    );
    const isValidZapRequest = validateZapRequest(zapReceipt, publicKey);
    if (!isValidZapRequest) {
      throw new AppError('Invalid zapRequest', 403);
    }

    // Prisma
    let updateOrderResponse: updateOrderResponse;
    try {
      updateOrderResponse = await updateOrder(fullname, email, zapReceipt);
    } catch (error: any) {
      throw new AppError('Failed to update order', 500);
    }

    // AWS SES
    try {
      await ses.sendEmailOrder(email, updateOrderResponse.ticketId);
    } catch (error: any) {
      throw new AppError('Failed to send order email', 500);
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
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
