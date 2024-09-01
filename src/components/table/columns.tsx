'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';

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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Check-In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div>{row.original.user.fullname}</div>
        <div className="text-sm text-gray-500">{row.original.user.email}</div>
      </div>
    ),
    sortingFn: (a, b) => {
      const nameA = a.original.user.fullname.toLowerCase();
      const nameB = b.original.user.fullname.toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      const emailA = a.original.user.email.toLowerCase();
      const emailB = b.original.user.email.toLowerCase();

      return emailA.localeCompare(emailB);
    },
  },
  {
    accessorKey: 'qty',
    header: 'Quantity',
  },
  {
    accessorKey: 'totalMiliSats',
    header: 'Total (sats)',
    cell: ({ row }) => (
      <span>{Math.round(row.original.totalMiliSats / 1000)}</span>
    ),
  },
  // {
  //   accessorKey: 'paid',
  //   header: 'Paid',
  //   cell: ({ row }) => (
  //     <Badge variant={row.original.paid ? 'default' : 'destructive'}>
  //       {row.original.paid ? 'Paid' : 'Not Paid'}
  //     </Badge>
  //   ),
  // },
  {
    accessorKey: 'checkIn',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Check-In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant={row.original.checkIn ? 'default' : 'destructive'}>
        {row.original.checkIn ? 'Checked In' : 'Not Checked In'}
      </Badge>
    ),
  },
];
