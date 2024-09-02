import { Order, User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { calculateTicketPrice } from './price';
import { Event } from 'nostr-tools';
import { prisma } from '@/services/prismaClient';

export interface CreateOrderResponse {
  totalMiliSats: number;
  referenceId: string;
}

export interface updateOrderResponse {
  referenceId: string;
  ticketId: string;
  qty: number;
  totalMiliSats: number;
  zapReceiptId: string;
  paid: boolean;
}

async function createOrder(
  fullname: string,
  email: string,
  qty: number
): Promise<CreateOrderResponse> {
  let user: User = await prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: { fullname, email },
  });

  const referenceId: string = randomBytes(32).toString('hex');
  const ticketPriceArs: number = parseInt(process.env.TICKET_PRICE_ARS!);
  const totalMiliSats = await calculateTicketPrice(qty, ticketPriceArs);

  const order: Order = await prisma.order.create({
    data: {
      referenceId,
      qty,
      totalMiliSats,
      userId: user.id,
    },
  });

  const response: CreateOrderResponse = {
    totalMiliSats,
    referenceId,
  };

  return response;
}

async function updateOrder(
  fullname: string,
  email: string,
  zapReceipt: Event
): Promise<updateOrderResponse> {
  const orderReferenceId = zapReceipt.tags.find((tag) => tag[0] === 'e')![1];
  const ticketId: string = randomBytes(16).toString('hex');

  // Update order to paid
  const order: Order | null = await prisma.order.update({
    where: {
      referenceId: orderReferenceId,
    },
    data: {
      ticketId,
      paid: true,
      zapReceiptId: zapReceipt.id,
    },
  });

  const user: User | null = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      fullname,
    },
  });

  if (!order || !user) {
    throw new Error('Order or user not found');
  }

  const response: updateOrderResponse = {
    referenceId: orderReferenceId,
    ticketId,
    qty: order.qty,
    totalMiliSats: order.totalMiliSats,
    zapReceiptId: order.zapReceiptId!,
    paid: order.paid,
  };

  return response;
}

async function getOrder(referenceId: string): Promise<Order | null> {
  const order: Order | null = await prisma.order.findUnique({
    where: {
      referenceId,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

async function checkInOrder(ticketId: string): Promise<Order> {
  const order: Order | null = await prisma.order.update({
    where: {
      ticketId,
    },
    data: {
      checkIn: true,
    },
  });

  if (!order) {
    throw new Error('Error checking in order');
  }

  return order;
}

export { createOrder, updateOrder, checkInOrder };
