import { checkInOrder, getOrder } from './../../../lib/utils/prisma';
import { AppError } from '@/app/lib/errors/appError';
import { Order } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const { orderReferenceId } = await req.json();

    const order: Order | null = await getOrder(orderReferenceId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paid) {
      await checkInOrder(orderReferenceId); // Update checkIn status if order is paid
    }

    return NextResponse.json({
      status: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
