import { PrismaClient } from '@prisma/client';
import { AppError } from '@/lib/errors/appError';
import { NextRequest, NextResponse } from 'next/server';
import { contentSchema, orderEventSchema } from '@/lib/validation/ordersSchema';
import { validateOrderEvent } from '@/lib/validation/ordersSchema';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const { authEvent } = await req.json();

    if (!authEvent) {
      throw new AppError('Missing auth event', 400);
    }

    // Zod
    const result = orderEventSchema.safeParse(authEvent);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    // Event validation
    const adminPublicKey = process.env.ADMIN_KEY!;

    const isValidOrderEvent = validateOrderEvent(result.data, adminPublicKey);

    if (!isValidOrderEvent) {
      throw new AppError('Invalid order event', 403);
    }

    const contentResult = contentSchema.safeParse(
      JSON.parse(result.data.content)
    );

    if (!contentResult.success) {
      throw new AppError(contentResult.error.errors[0].message, 403);
    }

    const { limit, checked_in, ticket_id, email } = contentResult.data;

    // Prisma
    const whereClause: any = {
      paid: true,
      ...(checked_in !== undefined && { checkIn: checked_in }),
      ...(ticket_id && { ticketId: ticket_id }),
      ...(email && {
        User: {
          email: email,
        },
      }),
    };

    const orders = await prisma.order.findMany({
      take: limit || undefined,
      where: whereClause,
      include: {
        User: {
          select: {
            fullname: true,
            email: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      user: {
        fullname: order.User?.fullname,
        email: order.User?.email,
      },
      ticketId: order.ticketId,
      qty: order.qty,
      totalMiliSats: order.totalMiliSats,
      paid: order.paid,
      checkIn: order.checkIn,
    }));

    return NextResponse.json({
      status: true,
      data: formattedOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
