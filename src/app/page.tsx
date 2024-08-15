'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useNostr, useSubscription, useZap } from '@lawallet/react';
import { Event } from 'nostr-tools';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Navbar } from '@/components/navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { cn } from '@/lib/utils';

// Generic
import { FormCustomer } from '../containers/form-customer';
import { FormPayment } from '../containers/form-payment';
import { Order, OrderRequest, OrderUserData } from '@/types/orders';

// Icons
import { SleepingIcon } from '@/components/icons/SleepingIcon';
import { CreditCardValidationIcon } from '@/components/icons/CreditCardValidationIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { MinusIcon } from '@/components/icons/MinusIcon';

import useOrder from '@/hooks/useOrder';

// Mock data
const TICKET = {
  title: 'Ticket #1',
  description:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit impedit aperiam, optio dolores tenetur earum.',
  imageUrl: 'https://placehold.co/400',
  value: 1,
  valueType: 'SAT',
};

const ZAP_RECEIPT_EVENT: Event = {
  content: '',
  created_at: 123123,
  id: '',
  kind: 9735,
  pubkey: '',
  sig: '',
  tags: [],
};

const ORDER_DATA: OrderUserData = {
  fullname: 'Testito',
  email: 'testito@lacrypta.ar',
};

export default function Page() {
  // Flow
  const [screen, setScreen] = useState<string>('information');
  const [isLoading, setIsloading] = useState<boolean>(true);

  // Dialog for reset invoice
  const [open, setOpen] = useState<boolean>(false);

  // Claim invoice
  const [newEvent, setNewEvent] = useState<Event | undefined>(undefined);
  const [userData, setUserData] = useState<OrderUserData | undefined>(
    undefined
  );

  // Hooks
  const {
    orderReferenceId,
    ticketsQty,
    paymentRequest,
    isPaid,
    requestNewOrder,
    claimOrderPayment,
    setOrderReferenceId,
    setTicketsQty,
    setPaymentRequest,
    setIsPaid,
    clear,
  } = useOrder();

  const { events, loading } = useSubscription({
    filters: [{ kinds: [9735], '#e': [orderReferenceId!] }],
    options: { closeOnEose: false },
    enabled: Boolean(orderReferenceId),
  });

  const emulateZapPayment = useCallback(
    async (data: OrderUserData) => {
      console.log('emulateZapPayment');

      if (newEvent === undefined) {
        console.warn('No event received to process payment');
        return;
      }

      const order = await claimOrderPayment(data, newEvent);

      console.info('order:');
      console.dir(order);

      setNewEvent(undefined);
      setIsPaid(true);
    },
    [newEvent, setNewEvent, claimOrderPayment, setIsPaid]
  );

  useEffect(() => {
    if (events && events.length > 0 && userData) {
      let event: Event = {
        tags: events[0].tags as string[][],
        content: events[0].content as string,
        created_at: events[0].created_at as number,
        pubkey: events[0].pubkey as string,
        id: events[0].id as string,
        kind: events[0].kind as number,
        sig: events[0].sig as string,
      };

      console.log('Event received:', event);
      setNewEvent(event);
      emulateZapPayment(userData);
    } else {
      console.warn('No event received to process payment');
    }
  }, [events, emulateZapPayment, userData]);

  const handleCreateOrder = useCallback(
    async (data: OrderUserData) => {
      if (isLoading) return;

      setIsloading(true);
      clear();

      setScreen('payment');

      // Create new order
      try {
        const order = await requestNewOrder({ ...data, qty: ticketsQty });
        setPaymentRequest(order.pr);
        setOrderReferenceId(order.orderReferenceId);

        window.scrollTo({
          top: 0,
          behavior: 'auto',
        });

        setUserData(data);
        // // Emulate payment
        // setTimeout(() => {
        //   emulateZapPayment(data);
        // }, 2000);
      } catch {
        alert('Error creating order');
      } finally {
        setIsloading(false);
      }
    },
    [
      isLoading,
      ticketsQty,
      clear,
      requestNewOrder,
      setPaymentRequest,
      setOrderReferenceId,
      // emulateZapPayment,
    ]
  );

  useEffect(() => {
    if (isPaid) {
      setScreen('summary');
    }
  }, [isPaid]);

  useEffect(() => {
    setIsloading(false);
  }, []);

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-full min-h-[100dvh]">
        {/* Aside info */}
        <aside className="bg-card relative flex justify-center items-center w-full min-h-full pt-[60px] md:pt-0">
          <Navbar />
          <div
            className={cn(
              'w-full max-w-[520px]  px-4',
              screen === 'information' ? 'my-4' : ''
            )}
          >
            {screen === 'information' ? (
              <>
                <Card className="p-4 bg-background">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h2 className="text-md">{TICKET.title}</h2>
                      <p className="font-semibold text-lg">
                        {TICKET.value} {TICKET.valueType}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        variant={
                          screen !== 'information' || ticketsQty === 1
                            ? 'ghost'
                            : 'secondary'
                        }
                        size="icon"
                        onClick={() => setTicketsQty(ticketsQty - 1)}
                        disabled={screen !== 'information' || ticketsQty === 1}
                      >
                        <MinusIcon />
                      </Button>
                      <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                        {screen !== 'information' && (
                          <span className="font-normal text-xs text-text">
                            x
                          </span>
                        )}
                        {ticketsQty}
                      </p>
                      <Button
                        variant={
                          screen !== 'information' ? 'ghost' : 'secondary'
                        }
                        size="icon"
                        onClick={() => setTicketsQty(ticketsQty + 1)}
                        disabled={screen !== 'information'}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-text">{TICKET.description}</p>
                </Card>

                <div className="p-4">
                  <div className="flex gap-4 justify-between items-center">
                    <p className="text-text">Total</p>
                    <p className="font-bold text-md">
                      {TICKET.value * ticketsQty} {TICKET.valueType}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full md:hidden"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="flex gap-2 no-underline">
                      <div className="flex items-center justify-between gap-2 w-full">
                        Show order summary
                        <p className="font-bold text-lg no-underline">
                          {TICKET.value * ticketsQty} {TICKET.valueType}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="p-4 bg-background">
                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <h2 className="text-md">{TICKET.title}</h2>
                            <p className="font-semibold text-lg">
                              {TICKET.value} {TICKET.valueType}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                              {screen !== 'information' && (
                                <span className="font-normal text-text">x</span>
                              )}
                              {ticketsQty}
                            </p>
                          </div>
                        </div>
                      </Card>
                      <div className="p-4">
                        <div className="flex gap-4 justify-between items-center">
                          <p className="text-text text-md">Total</p>
                          <p className="font-bold text-md">
                            {TICKET.value * ticketsQty} {TICKET.valueType}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="hidden md:block ">
                  <Card className="p-4 bg-background">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h2 className="text-md">{TICKET.title}</h2>
                        <p className="font-semibold text-lg">
                          {TICKET.value} {TICKET.valueType}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                          {screen !== 'information' && (
                            <span className="font-normal text-text">x</span>
                          )}
                          {ticketsQty}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <div className="p-4">
                    <div className="flex gap-4 justify-between items-center">
                      <p className="text-text">Total</p>
                      <p className="font-bold text-md">
                        {TICKET.value * ticketsQty} {TICKET.valueType}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Section data */}
        <section className="relative flex flex-1 md:flex-auto w-full justify-center md:pr-4">
          <div className="flex flex-col gap-4 px-4 w-full py-4 max-w-[520px] pt-[80px]">
            <div className="absolute top-0 left-0 w-full h-[60px] flex justify-center items-center mx-auto  px-4 border-b-[1px] border-border">
              <div className="w-full max-w-[520px]">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={cn(
                          '',
                          screen === 'information' ? 'text-white' : 'text-text'
                        )}
                      >
                        Information
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={cn(
                          '',
                          screen === 'payment' ? 'text-white' : 'text-text'
                        )}
                      >
                        Payment
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={cn(
                          '',
                          screen === 'summary' ? 'text-white' : 'text-text'
                        )}
                      >
                        Summary
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            {screen === 'information' && (
              <FormCustomer onSubmit={handleCreateOrder} />
            )}

            {screen === 'payment' && <FormPayment invoice={paymentRequest} />}

            {screen === 'summary' && (
              <>
                <Card>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full mx-auto py-12 px-8">
                    <CreditCardValidationIcon className="w-8 h-8" />
                    <div className="flex flex-col gap-2 text-center">
                      <h2 className="font-bold text-2xl">Congratulation!</h2>
                      <p className="text-text">
                        Your payment has been confirmed. We have sent the event
                        details to your email.
                      </p>
                    </div>
                  </div>
                </Card>
                <Link href="/">
                  <Button className="w-full" variant="link">
                    Back to page
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <SleepingIcon className="w-8 h-8 color-primary" />
            <AlertDialogTitle className="text-center">
              Oops! Try again
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {`It looks like you weren't able to complete the transaction in time.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 p-0">
              <Button className="w-full" variant="secondary" tabIndex={-1}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1">Try again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
