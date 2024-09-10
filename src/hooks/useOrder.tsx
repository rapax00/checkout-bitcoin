import { useCallback, useState } from 'react';
import {
  OrderClaimReturn,
  OrderRequestData,
  OrderRequestReturn,
  OrderUserData,
} from '@/types/orders';
import { Event } from 'nostr-tools';

interface UseOrderReturn {
  isPaid: boolean;
  requestNewOrder: (data: OrderRequestData) => Promise<OrderRequestReturn>;
  claimOrderPayment: (
    data: OrderUserData,
    zapReceiptEvent: Event
  ) => Promise<OrderClaimReturn>;
  clear: () => void;
}

const useOrder = (): UseOrderReturn => {
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const requestNewOrder = useCallback(
    async (data: OrderRequestData): Promise<OrderRequestReturn> => {
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

        const result: { data: { pr: string; eventReferenceId: string } } =
          await response.json();

        setIsPaid(false);

        return new Promise((resolve) => {
          console.log('requestNewOrder', result.data);
          resolve({ ...result.data });
        });
      } catch (error: any) {
        throw error;
      }
    },
    [setIsPaid]
  );

  const clear = useCallback(() => {
    setIsPaid(false);
  }, [setIsPaid]);

  const claimOrderPayment = async (
    data: OrderUserData,
    zapReceiptEvent: Event
  ): Promise<OrderClaimReturn> => {
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

      const result: { data: { claim: boolean } } = await response.json();

      setIsPaid(result.data.claim);

      return new Promise((resolve) => {
        console.log('claimOrderPayment', result.data);
        resolve({
          ...result.data,
        });
      });
    } catch (error: any) {
      throw error;
    }
  };

  return {
    isPaid,
    claimOrderPayment,
    requestNewOrder,
    clear,
  };
};

export default useOrder;
