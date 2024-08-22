import { NextRequest, NextResponse } from 'next/server';
import { Event } from 'nostr-tools';
import { generateZapRequest } from '@/app/lib/utils/nostr';
import { generateInvoice, getLnurlpFromWalias } from '@/app/services/ln';
import { createOrder, CreateOrderResponse } from '@/app/lib/utils/prisma';
import { ticketSchema } from '@/app/lib/validation/ticketSchema';
import { sendy } from '@/app/services/sendy';
import { ses } from '@/app/services/ses';
import { AppError } from '@/app/lib/errors/appError';

interface RequestTicketResponse {
  pr: string;
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
    const result = ticketSchema.safeParse(body);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    const { fullname, email, qty, newsletter } = result.data;

    // Prisma Create order and user (if not created before) in prisma
    let orderResponse: CreateOrderResponse;
    try {
      orderResponse = await createOrder(fullname, email, qty);
    } catch (error) {
      throw new AppError('Failed to create order', 500);
    }

    // Sendy
    // Subscribe to newsletter
    if (newsletter) {
      const sendyResponse = await sendy.subscribe({
        name: fullname,
        email,
        listId: process.env.SENDY_LIST!,
      });

      if (!sendyResponse.success) {
        throw new AppError(
          `Add to Sendy list failed. ${sendyResponse.message}`,
          404
        );
      }
    }

    // AWS SES
    try {
      await ses.sendEmailNewsletter(email);
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to send email via SES', 500);
    }

    // Lnurlp
    let lnurlp;
    try {
      const posWalias = process.env.POS_WALIAS!;
      lnurlp = await getLnurlpFromWalias(posWalias);
    } catch (error) {
      throw new AppError('Failed to retrieve LNURLP data', 500);
    }

    // Zap Request
    let zapRequest: Event;
    try {
      zapRequest = generateZapRequest(
        orderResponse.referenceId,
        orderResponse.totalMiliSats,
        lnurlp.nostrPubkey
      );
    } catch (error: any) {
      throw new AppError('Failed to generate Zap Request', 500);
    }

    // Invoice
    let invoice: string;
    try {
      invoice = await generateInvoice(
        lnurlp.callback,
        orderResponse.totalMiliSats,
        zapRequest
      );
    } catch (error: any) {
      throw new AppError('Failed to generate Invoice', 500);
    }

    // Response
    const response: RequestTicketResponse = {
      pr: invoice,
      orderReferenceId: orderResponse.referenceId,
      qty,
      totalMiliSats: orderResponse.totalMiliSats,
    };

    return NextResponse.json({
      status: true,
      data: response,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
