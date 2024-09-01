'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, QrCode, Search, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react';
import { DataTable } from '@/components/table/data-table';
import { columns } from '@/components/table/columns';
import { EventTemplate, finalizeEvent, Event, getPublicKey } from 'nostr-tools';

interface OrderInfo {
  user: {
    fullname: string;
    email: string;
  };
  ticketId: string;
  qty: number;
  totalMiliSats: number;
  paid: boolean;
  checkIn: boolean;
}

export default function AdminPage() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ALWAYS FALSE
  const [privateKey, setPrivateKey] = useState('');
  const [loginStatus, setLoginStatus] = useState<string>('idle');
  // Ticket
  const [orders, setOrders] = useState<OrderInfo[]>([]);

  const handleLogin = async () => {
    try {
      if (!privateKey) {
        setLoginStatus('error');
        return;
      }
      const privKey = Uint8Array.from(Buffer.from(privateKey, 'hex'));

      const publicKey = getPublicKey(privKey);

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      setIsAuthenticated(true);
      setLoginStatus('idle');
      fetchOrders();
    } catch (error: any) {
      setLoginStatus(error.message);
    }
  };

  const handleFetchOrders = () => {
    fetchOrders();
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const unsignedAuthEvent: EventTemplate = {
        kind: 27242,
        tags: [] as string[][],
        content: '{\n  "limit": 0}',
        created_at: Math.round(Date.now() / 1000),
      };

      const privKey = Uint8Array.from(Buffer.from(privateKey, 'hex'));

      const authEvent: Event = finalizeEvent(unsignedAuthEvent, privKey);

      const response = await fetch('/api/ticket/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authEvent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
      const data = await response.json();
      setOrders(data.data);
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  };

  // const handleVerifyAndCheckIn = async () => {
  //   if (!ticketId.trim()) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch('/api/ticket/checkin', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ ticketId }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || response.statusText);
  //     }

  //     const {
  //       data: { alreadyCheckedIn, order, user },
  //     } = await response.json();
  //   } catch (error: any) {
  //     console.error('Error:', error.message);
  //   }
  // };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter private key"
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
          {loginStatus !== 'idle' && (
            <Alert variant="destructive">
              <AlertCircle className="h-auto w-auto" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{loginStatus}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Description</CardDescription>
          <div className="flex space-x-2">
            <Input placeholder="Search" />
            <Button className="h-fit w-fit" onClick={() => {}}>
              <Search className="h-4 w-4 mr-2"></Search>Search
            </Button>
            <Button className="h-fit w-fit" onClick={() => {}}>
              <QrCode className="h-4 w-4 mr-2"></QrCode> Scan QR
            </Button>
          </div>
          <Button className="h-fit w-full" onClick={handleFetchOrders}>
            <RefreshCcw className="h-4 w-4 mr-2"></RefreshCcw>Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={orders}></DataTable>
        </CardContent>
        <CardFooter>
          <p>Footer</p>
        </CardFooter>
      </Card>
    </>
  );
}
