import { NextRequest, NextResponse } from 'next/server';
import { Event } from 'nostr-tools';
import { generateZapRequest } from '@/app/lib/utils/nostr';
import { generateInvoice, getLnurlpFromWalias } from '@/app/services/ln';
import { createOrder, CreateOrderResponse } from '@/app/lib/utils/prisma';
import { ticketSchema } from '@/app/lib/validation/ticketSchema';
import { sendy } from '@/app/services/sendy';
import { ses } from '@/app/services/ses';

interface RequestTicketResponse {
  pr: string;
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
  const result = ticketSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: false, errors: result.error.errors },
      { status: 400 }
    );
  }

  const { fullname, email, qty, newsletter } = result.data;

  // Prisma Create order and user (if not created before) in prisma
  const orderResponse: CreateOrderResponse = await createOrder(
    fullname,
    email,
    qty
  );

  // Sendy
  // Subscribe to newsletter
  if (newsletter) {
    const sendyResponse = await sendy.subscribe({
      name: fullname,
      email,
      listId: process.env.SENDY_LIST!,
    });

    // AWS SES
    try {
      await ses.sendEmailNewsletter(email);
    } catch (error) {
      return NextResponse.json(
        { status: false, errors: error },
        { status: 500 }
      );
    }

    if (!sendyResponse.success) {
      return NextResponse.json(
        {
          status: false,
          errors: `Add to sendy list failed. ${sendyResponse.message}`,
        },
        { status: 404 }
      );
    }
  }

  // Lnurlp
  const posWalias = process.env.POS_WALIAS!;
  const lnurlp = await getLnurlpFromWalias(posWalias);

  // Zap Request
  const zapRequest: Event = generateZapRequest(
    orderResponse.referenceId,
    orderResponse.totalMiliSats,
    lnurlp.nostrPubkey
  );

  // Invoice
  const invoice = await generateInvoice(
    lnurlp.callback,
    orderResponse.totalMiliSats,
    zapRequest
  );

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
}
