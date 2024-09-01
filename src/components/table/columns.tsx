'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';

export type OrderInfo = {
  user: {
    fullname: string;
    email: string;
  };
  ticketId: string;
  qty: number;
  totalMiliSats: number;
  paid: boolean;
  checkIn: boolean;
};

export const columns: ColumnDef<OrderInfo>[] = [
  {
    accessorKey: 'ticketId',
    header: 'Ticket ID',
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div>
        <div>{row.original.user.fullname}</div>
        <div className="text-sm text-gray-500">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'qty',
    header: 'Quantity',
  },
  {
    accessorKey: 'totalMiliSats',
    header: 'Total (mSats)',
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ row }) => (
      <Badge variant={row.original.paid ? 'default' : 'destructive'}>
        {row.original.paid ? 'Paid' : 'Not Paid'}
      </Badge>
    ),
  },
  {
    accessorKey: 'checkIn',
    header: 'Check In',
    cell: ({ row }) => (
      <Badge variant={row.original.checkIn ? 'default' : 'destructive'}>
        {row.original.checkIn ? 'Checked In' : 'Not Checked In'}
      </Badge>
    ),
  },
];
