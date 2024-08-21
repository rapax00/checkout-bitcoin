import { useCallback, useState } from 'react';
import { Order, OrderRequest, OrderUserData } from '@/types/orders';
import { Event } from 'nostr-tools';
import { useLocalStorage } from 'usehooks-ts';

interface UseOrderReturn {
  ticketsQty: number;
  orderReferenceId: string | undefined;
  paymentRequest: string | undefined;
  isPaid: boolean;
  setTicketsQty: (qty: number) => void;
  setOrderReferenceId: (orderReferenceId: string | undefined) => void;
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
  const [ticketsQty, setTicketsQty] = useState(1);
  const [orderReferenceId, setOrderReferenceId] = useState<string | undefined>(
    undefined
  );
  const [paymentRequest, setPaymentRequest] = useState<string | undefined>(
    undefined
  );
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // const [userData, setUserData, removeUserData] =
  //   useLocalStorage<OrderUserData>('userData', {
  //     fullname: '',
  //     email: '',
  //     newsletter: false,
  //   });

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
          throw new Error('Failed to create order');
        }

        const result: { status: string; data: Order } = await response.json();
        setOrderReferenceId(result.data.orderReferenceId);
        setPaymentRequest(result.data.pr);
        setIsPaid(false);

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ...data,
              totalMiliSats: result.data.totalMiliSats,
              orderReferenceId: result.data.orderReferenceId,
              pr: result.data.pr,
            });

            setOrderReferenceId(result.data.orderReferenceId);
            setPaymentRequest(result.data.pr);
            setIsPaid(false);
          }, 1000);
        });
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    [setIsPaid, setOrderReferenceId, setPaymentRequest]
  );

  const clear = useCallback(() => {
    setOrderReferenceId(undefined);
    setPaymentRequest(undefined);

    setIsPaid(false);
  }, [setIsPaid, setOrderReferenceId, setPaymentRequest]);

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
        const body = await response.json();

        console.log('ERROR: ', body.errors);

        throw new Error('Failed to claim order payment');
      }

      const result: { status: string; data: Order } = await response.json(); // pr is not returned in the response
      setIsPaid(true);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            fullname: result.data.fullname,
            email: result.data.email,
            orderReferenceId: result.data.orderReferenceId,
            qty: result.data.qty,
            totalMiliSats: result.data.totalMiliSats,
            pr: '',
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Error claiming order payment:', error);
      throw error;
    }
  };

  return {
    ticketsQty,
    orderReferenceId,
    paymentRequest,
    isPaid,
    setTicketsQty,
    setOrderReferenceId,
    setPaymentRequest,
    claimOrderPayment,
    requestNewOrder,
    setIsPaid,
    clear,
  };
};

export default useOrder;