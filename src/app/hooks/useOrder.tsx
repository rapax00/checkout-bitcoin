import { useCallback } from "react";
import { Order, OrderRequest } from "../types/orders";
import { Event } from "nostr-tools";

interface UseOrderReturn {
  requestNewOrder: (data: OrderRequest) => Promise<Order>;
  claimOrderPayment: (zapReceiptEvent: Event) => Promise<Order>;
}

const useOrder = (): UseOrderReturn => {
  const requestNewOrder = useCallback(
    async (data: OrderRequest): Promise<Order> => {
      // Emulate request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...data,
            total: 100,
            orderReferenceId: "123456",
            pr: "asdad",
          });
        }, 1000);
      });
    },
    []
  );

  const claimOrderPayment = async (zapReceiptEvent: Event): Promise<Order> => {
    // Emulate request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          email: "",
          fullname: "",
          qty: 2,
          total: 100,
          orderReferenceId: "123456",
          pr: "asdad",
        });
      }, 1000);
    });
  };

  return {
    requestNewOrder,
    claimOrderPayment,
  };
};

export default useOrder;
