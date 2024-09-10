import { useCallback, useState } from 'react';
import { Order, OrderRequest, OrderUserData } from '@/types/orders';
import { Event } from 'nostr-tools';
import { useLocalStorage } from 'usehooks-ts';

interface UseOrderReturn {
  ticketQuantity: number;
  totalSats: number;
  eventReferenceId: string | undefined;
  paymentRequest: string | undefined;
  isPaid: boolean;
  setTicketQuantity: (qty: number) => void;
  setTotalSats: (totalSats: number) => void;
  setEventReferenceId: (eventReferenceId: string | undefined) => void;
  requestNewOrder: (data: OrderRequest) => Promise<Order>;
  claimOrderPayment: (
    data: OrderUserData,
    zapReceiptEvent: Event
  ) => Promise<Order>;
  setPaymentRequest: (paymentRequest: string | undefined) => void;
  setIsPaid: (isPaid: boolean) => void;
  clear: () => void;
}

const useOrder = (): UseOrderReturn => {
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [totalSats, setTotalSats] = useState<number>(0);
  const [eventReferenceId, setEventReferenceId] = useState<string | undefined>(
    undefined
  );
  const [paymentRequest, setPaymentRequest] = useState<string | undefined>(
    undefined
  );
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const requestNewOrder = useCallback(
    async (data: OrderRequest): Promise<Order> => {
      try {
        const response = await fetch('/api/ticket/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${errorData.errors || response.statusText}`);
        }

        const result: { status: string; data: Order } = await response.json();

        setEventReferenceId(result.data.eventReferenceId);
        setPaymentRequest(result.data.pr);
        setIsPaid(false);

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ...data,
              totalMiliSats: result.data.totalMiliSats,
              eventReferenceId: result.data.eventReferenceId,
              pr: result.data.pr,
            });

            setEventReferenceId(result.data.eventReferenceId);
            setPaymentRequest(result.data.pr);
            setIsPaid(false);
          }, 1000);
        });
      } catch (error: any) {
        console.error(error.message);
        // alert(error.message);
        throw error;
      }
    },
    [setIsPaid, setEventReferenceId, setPaymentRequest]
  );

  const clear = useCallback(() => {
    setEventReferenceId(undefined);
    setPaymentRequest(undefined);
    setIsPaid(false);
  }, [setIsPaid, setEventReferenceId, setPaymentRequest]);

  const claimOrderPayment = async (
    data: OrderUserData,
    zapReceiptEvent: Event
  ): Promise<Order> => {
    try {
      const body: any = {
        fullname: data.fullname,
        email: data.email,
        zapReceipt: zapReceiptEvent,
      };

      const response = await fetch(`/api/ticket/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.errors || response.statusText}`);
      }

      const result: { status: string; data: Order } = await response.json();
      setIsPaid(true);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            fullname: result.data.fullname,
            email: result.data.email,
            eventReferenceId: result.data.eventReferenceId,
            ticketQuantity: result.data.ticketQuantity,
            totalMiliSats: result.data.totalMiliSats,
            pr: '',
          });
        }, 1000);
      });
    } catch (error: any) {
      console.error(error.message);
      // alert(error.message);
      throw error;
    }
  };

  return {
    ticketQuantity,
    totalSats,
    eventReferenceId,
    paymentRequest,
    isPaid,
    setTicketQuantity,
    setTotalSats,
    setEventReferenceId,
    setPaymentRequest,
    claimOrderPayment,
    requestNewOrder,
    setIsPaid,
    clear,
  };
};

export default useOrder;
