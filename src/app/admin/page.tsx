'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Order, User } from '@prisma/client';

const OrderDetails = ({ order, user }: { order: Order; user: User }) => (
  <div className="mt-4 space-y-2">
    <h3 className="font-semibold text-lg">Order Details</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <p className="font-medium">Customer Name:</p>
      <p>{user.fullname}</p>
      <p className="font-medium">Customer Email:</p>
      <p>{user.email}</p>
      <p className="font-medium">Ticket ID:</p>
      <p>{order.ticketId}</p>
      <p className="font-medium">Quantity:</p>
      <p>{order.qty}</p>
      <p className="font-medium">Total (mSats):</p>
      <p>{order.totalMiliSats}</p>
      <p className="font-medium">Payment Status:</p>
      <Badge variant={order.paid ? 'default' : 'destructive'}>
        {order.paid ? 'Paid' : 'Unpaid'}
      </Badge>
      <p className="font-medium">Check-In Status:</p>
      <Badge variant={order.checkIn ? 'default' : 'secondary'}>
        {order.checkIn ? 'Checked In' : 'Not Checked In'}
      </Badge>
    </div>
  </div>
);

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false); // ALWAYS FALSE
  const [password, setPassword] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [orderInfo, setOrderInfo] = useState<Order | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    if (password === process.env.PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleVerifyAndCheckIn = async () => {
    if (!ticketId.trim()) {
      setVerificationStatus('error');
      setOrderInfo(null);
      setUserInfo(null);
      setIsCheckingIn(false);
      return;
    }

    try {
      const response = await fetch('/api/ticket/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const {
        data: { alreadyCheckedIn, order, user },
      } = await response.json();

      setVerificationStatus('success');
      setOrderInfo(order);
      setUserInfo(user);
      setIsCheckingIn(alreadyCheckedIn);
      setIsOpen(true);
    } catch (error: any) {
      console.error('Error:', error.message);
      setVerificationStatus('error');
      setOrderInfo(null);
      setUserInfo(null);
      setIsCheckingIn(false);
    }
  };

  if (!authenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Order Verification and Check-In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter Ticket ID"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <Button onClick={handleVerifyAndCheckIn}>Verify & Check-In</Button>
        </div>
        {verificationStatus === 'success' && orderInfo && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Alert variant="destructive">ALERTA DESTRUCTIVA</Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </Alert>
            <Alert
              variant={
                isCheckingIn
                  ? 'destructive'
                  : orderInfo.paid
                  ? 'default'
                  : 'destructive'
              }
            >
              {isCheckingIn ? (
                <AlertCircle className="h-4 w-4" />
              ) : orderInfo.paid ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {isCheckingIn
                  ? 'Already checked'
                  : orderInfo.paid
                  ? 'Valid Order'
                  : 'Unpaid Order'}
              </AlertTitle>
              <AlertDescription>
                El ticket {orderInfo.ticketId}
                {orderInfo.paid
                  ? orderInfo.checkIn
                    ? ' ya está checkeado.'
                    : ' es válido'
                  : ' no fue pagado.'}
              </AlertDescription>
            </Alert>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mt-2">
                {isOpen ? 'Hide Details' : 'Show Details'}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <OrderDetails order={orderInfo} user={userInfo!} />
            </CollapsibleContent>
          </Collapsible>
        )}
        {verificationStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              An error occurred while verifying the order. Please check the
              Reference ID and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
