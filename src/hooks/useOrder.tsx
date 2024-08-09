import { useCallback } from "react";
import { Order, OrderRequest, OrderUserData } from "@/types/orders";
import { Event } from "nostr-tools";
import { useLocalStorage } from "usehooks-ts";

interface UseOrderReturn {
  ticketsQty: number;
  orderReferenceId: string | undefined;
  paymentRequest: string | undefined;
  isPaid: boolean;
  setTicketsQty: (qty: number) => void;
  setOrderReferenceId: (orderReferenceId: string | undefined) => void;
  requestNewOrder: (data: OrderRequest) => Promise<Order>;
  claimOrderPayment: (zapReceiptEvent: Event) => Promise<Order>;
  setPaymentRequest: (paymentRequest: string | undefined) => void;
}

const useOrder = (): UseOrderReturn => {
  const [ticketsQty, setTicketsQty] = useLocalStorage("tickets_qty", 1);
  const [orderReferenceId, setOrderReferenceId] = useLocalStorage<
    string | undefined
  >("orderReference", undefined);
  const [paymentRequest, setPaymentRequest] = useLocalStorage<
    string | undefined
  >("pay_req", undefined);
  const [isPaid, setIsPaid] = useLocalStorage<boolean>("is_paid", false);

  const [userData, setUserData, removeUserData] =
    useLocalStorage<OrderUserData>("userData", {
      fullname: "",
      email: "",
      newsletter: false,
    });

  const requestNewOrder = useCallback(
    async (data: OrderRequest): Promise<Order> => {
      // Emulate request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...data,
            total: 100,
            orderReferenceId: "123456",
            pr: "invoice",
          });

          setOrderReferenceId("123456");
          setPaymentRequest("invoice");
          setIsPaid(false);
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
    ticketsQty,
    orderReferenceId,
    paymentRequest,
    isPaid,
    setTicketsQty,
    setOrderReferenceId,
    setPaymentRequest,
    claimOrderPayment,
    requestNewOrder,
  };
};

export default useOrder;
