import {
  checkInEventSchema,
  validateOrderEvent,
} from '@/lib/validation/ordersSchema';
import { AppError } from '@/lib/errors/appError';
import { prisma } from '@/services/prismaClient';
import { Order, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { checkInOrder } from '@/lib/utils/prisma';

interface CheckInResponse {
  alreadyCheckedIn: boolean;
  order: Order;
  user: User;
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    // Auth event
    const { authEvent } = await req.json();

    if (!authEvent) {
      throw new AppError('Missing auth event', 400);
    }

    // Zod
    const result = checkInEventSchema.safeParse(authEvent);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    // Event validation
    const adminPublicKey = process.env.ADMIN_KEY!;

    const isValidOrderEvent = validateOrderEvent(result.data, adminPublicKey);

    const { ticket_id: ticketId } = JSON.parse(result.data.content);

    if (!isValidOrderEvent) {
      throw new AppError('Invalid order event', 403);
    }

    // Check if order
    const { order, user } = await prisma.$transaction(async () => {
      const order: Order | null = await prisma.order.findUnique({
        where: {
          ticketId,
        },
      });

      const user: User | null = await prisma.user.findUnique({
        where: {
          id: order?.userId,
        },
      });

      return { order, user };
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const alreadyCheckedIn: boolean = order.checkIn;

    let orderCheckIn: Order;
    if (order.paid) {
      orderCheckIn = await checkInOrder(ticketId); // Update checkIn status if order is paid
    }

    const data: CheckInResponse = {
      alreadyCheckedIn,
      order: order.paid ? orderCheckIn! : order,
      user: user!,
    };

    return NextResponse.json({
      status: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
