import { Order, Ticket, User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { Event } from 'nostr-tools';
import { prisma } from '@/services/prismaClient';

export interface CreateOrderResponse {
  eventReferenceId: string;
}

export interface UpdatePaidOrderResponse {
  tickets: Ticket[];
}

export interface CheckInTicketResponse {
  alreadyCheckedIn: boolean;
  checkIn: boolean;
}

// Create order and user (or update), not yet create ticket
async function createOrder(
  fullname: string,
  email: string,
  ticketQuantity: number,
  totalMiliSats: number
): Promise<CreateOrderResponse> {
  const eventReferenceId: string = randomBytes(32).toString('hex');

  const { order, user } = await prisma.$transaction(async () => {
    // Create or update user
    const user: User | null = await prisma.user.upsert({
      where: {
        email,
      },
      update: {},
      create: { fullname, email },
    });

    // Create order
    const order: Order | null = await prisma.order.create({
      data: {
        eventReferenceId,
        ticketQuantity,
        totalMiliSats,
        userId: user.id,
      },
    });

    return { order, user };
  });

  if (!order || !user) {
    throw new Error('Order or user not created');
  }

  const response: CreateOrderResponse = {
    eventReferenceId,
  };

  return response;
}

async function updatePaidOrder(
  fullname: string,
  email: string,
  zapReceipt: Event
): Promise<UpdatePaidOrderResponse> {
  const eventReferenceId = zapReceipt.tags.find((tag) => tag[0] === 'e')![1];

  const { order, user, tickets } = await prisma.$transaction(async () => {
    // Update order to paid
    const order: Order | null = await prisma.order.update({
      where: {
        eventReferenceId,
      },
      data: {
        paid: true,
        zapReceiptId: zapReceipt.id,
      },
    });

    // Update the user in case their name changes
    const user: User | null = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        fullname,
      },
    });

    if (!order || !user) {
      throw new Error('Order or user not found, cannot create ticket');
    }

    // Create tickets
    let tickets: Ticket[] = [];

    for (let i = 0; i < order!.ticketQuantity; i++) {
      const ticketId: string = randomBytes(16).toString('hex');

      const ticket: Ticket | null = await prisma.ticket.create({
        data: {
          ticketId,
          userId: user.id,
          orderId: order.id,
        },
      });

      tickets.push(ticket);
    }

    return { order, user, tickets };
  });

  if (!order || !user || tickets.length === 0) {
    throw new Error('Order or user not found or ticket not created');
  }

  const response: UpdatePaidOrderResponse = {
    tickets,
  };

  return response;
}

async function checkInTicket(ticketId: string): Promise<CheckInTicketResponse> {
  const { alreadyCheckedIn, checkIn } = await prisma.$transaction(
    // To Do: optimize this query with conditional update
    async () => {
      // Find ticket
      const ticket: Ticket | null = await prisma.ticket.findUnique({
        where: {
          ticketId,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if ticket is already checked in
      let alreadyCheckedIn = false;

      if (ticket.checkIn) {
        alreadyCheckedIn = true;

        return { alreadyCheckedIn, checkIn: true };
      }

      // Update ticket to checked in
      const ticketChecked: Ticket = await prisma.ticket.update({
        where: {
          ticketId,
        },
        data: {
          checkIn: true,
        },
      });

      if (!ticketChecked) {
        throw new Error('Error checking in ticket');
      }

      return { alreadyCheckedIn: false, checkIn: true };
    }
  );

  const response: CheckInTicketResponse = {
    alreadyCheckedIn,
    checkIn,
  };

  return response;
}

export { createOrder, updatePaidOrder, checkInTicket };
