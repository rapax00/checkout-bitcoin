import { checkInOrder } from './../../../lib/utils/prisma';
import { AppError } from '@/app/lib/errors/appError';
import { prisma } from '@/app/services/prismaClient';
import { Order, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

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

    const { ticketId } = await req.json();

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
