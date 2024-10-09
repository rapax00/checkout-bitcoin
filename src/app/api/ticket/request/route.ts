import { NextRequest, NextResponse } from 'next/server';
import { Event } from 'nostr-tools';
import { generateZapRequest } from '@/lib/utils/nostr';
import { generateInvoice, getLnurlpFromWalias } from '@/services/ln';
import { createOrder, CreateOrderResponse } from '@/lib/utils/prisma';
import { requestOrderSchema } from '@/lib/validation/requestOrderSchema';
import { ses } from '@/services/ses';
import { AppError } from '@/lib/errors/appError';
import { sendy } from '@/services/sendy';
import { calculateTicketPrice } from '@/lib/utils/price';

interface RequestTicketResponse {
  pr: string;
  eventReferenceId: string;
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const body = await req.json();

    // Zod
    const result = requestOrderSchema.safeParse(body);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    const { fullname, email, ticketQuantity, newsletter } = result.data;

    // Prisma Create order and user (if not created before) in prisma
    let orderResponse: CreateOrderResponse;
    // Calculate ticket price
    const ticketPriceArs = parseInt(process.env.NEXT_TICKET_PRICE_ARS!);
    const totalMiliSats =
      (await calculateTicketPrice(ticketQuantity, ticketPriceArs)) * 1000;

    try {
      orderResponse = await createOrder(
        fullname,
        email,
        ticketQuantity,
        totalMiliSats
      );
    } catch (error: any) {
      throw new AppError(`Failed to create order.`, 500);
    }

    // Sendy
    // Subscribe to newsletter
    if (newsletter) {
      const sendyResponse = await sendy.subscribe({
        name: fullname,
        email,
        listId: process.env.NEXT_SENDY_LIST_ID!,
      });

      if (sendyResponse.message !== 'Already subscribed') {
        if (!sendyResponse.success) {
          throw new AppError(
            `Subscribe to newsletter failed. ${sendyResponse.message}`,
            404
          );
        }

        // AWS SES
        try {
          await ses.sendEmailNewsletter(email);
        } catch (error: any) {
          throw new AppError(
            error.message || 'Failed to send email via SES',
            500
          );
        }
      }
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
        orderResponse.eventReferenceId,
        totalMiliSats,
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
        totalMiliSats,
        zapRequest
      );
    } catch (error: any) {
      throw new AppError('Failed to generate Invoice', 500);
    }

    // Response
    const response: RequestTicketResponse = {
      pr: invoice,
      eventReferenceId: orderResponse.eventReferenceId,
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
