'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LaWalletConfig, useZap } from '@lawallet/react';

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { cn } from '@/lib/utils';
import { config } from '@/config/config';

// Generic

// Icons
import { SleepingIcon } from "@/components/icons/SleepingIcon";
import { CreditCardValidationIcon } from "@/components/icons/CreditCardValidationIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { MinusIcon } from "@/components/icons/MinusIcon";

export default function Page() {
  const [countTickets, setCountTickets] = useState<number>(1);
  const [screen, setScreen] = useState<string>('information');

  // Dialog for reset invoice
  const [open, setOpen] = useState<boolean>(true);

  // Mock data
  const ticket = {
    title: 'Ticket #1',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit impedit aperiam, optio dolores tenetur earum.',
    imageUrl: 'https://placehold.co/400',
    value: 1,
    valueType: 'SAT',
  };

  // yisus@lawallet.ar
  const userPubkey: string = 'aed7a26265c4c9dad6a1c6f185a0cc2e6e638c9cc8666af020ea06dfe620937a';

  const { invoice, createZapInvoice, resetInvoice } = useZap({
    receiverPubkey: userPubkey,
    config,
  });

  const handleGenerateInvoice = async () => {
    if (invoice.loading) return;

    // Set value on SAT
    const localValue = ticket.value * countTickets;

    createZapInvoice(localValue).then((bolt11: string | undefined) => {
      if (!bolt11) {
        console.log('upds, algo paso mal');
        return;
      }

      setScreen('payment');
      window.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    });
  };

  const handleSaveTicket = () => {};

  useEffect(() => {
    if (invoice.payed) {
      handleSaveTicket();
      setScreen('summary');
    }
  }, [invoice.payed]);

  return (
    <LaWalletConfig config={config}>
      <div className='flex flex-col md:flex-row w-full min-h-[100dvh]'>
        {/* Aside info */}
        <aside className='bg-card relative flex justify-center items-center w-full min-h-full pt-[60px] md:pt-0'>
          <Navbar />
          <div className={cn('w-full max-w-[520px]  px-4', screen === 'information' ? 'my-4' : '')}>
            {screen === 'information' ? (
              <>
                <Card className='p-4 bg-background'>
                  <div className='flex justify-between items-center gap-4'>
                    <div>
                      <h2 className='text-md'>{ticket.title}</h2>
                      <p className='font-semibold text-lg'>
                        {ticket.value} {ticket.valueType}
                      </p>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Button
                        variant={screen !== 'information' || countTickets === 1 ? 'ghost' : 'secondary'}
                        size='icon'
                        onClick={() => setCountTickets(countTickets - 1)}
                        disabled={screen !== 'information' || countTickets === 1}
                      >
                        <MinusIcon />
                      </Button>
                      <p className='flex items-center justify-center gap-1 w-[40px] font-semibold'>
                        {screen !== 'information' && <span className='font-normal text-xs text-text'>x</span>}
                        {countTickets}
                      </p>
                      <Button
                        variant={screen !== 'information' ? 'ghost' : 'secondary'}
                        size='icon'
                        onClick={() => setCountTickets(countTickets + 1)}
                        disabled={screen !== 'information'}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                  <p className='mt-2 text-sm text-text'>{ticket.description}</p>
                </Card>

                <div className='p-4'>
                  <div className='flex gap-4 justify-between items-center'>
                    <p className='text-text'>Total</p>
                    <p className='font-bold text-md'>
                      {ticket.value * countTickets} {ticket.valueType}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Accordion type='single' collapsible className='w-full md:hidden'>
                  <AccordionItem value='item-1'>
                    <AccordionTrigger className='flex gap-2 no-underline'>
                      <div className='flex items-center justify-between gap-2 w-full'>
                        Show order summary
                        <p className='font-bold text-lg no-underline'>
                          {ticket.value * countTickets} {ticket.valueType}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className='p-4 bg-background'>
                        <div className='flex justify-between items-center gap-4'>
                          <div>
                            <h2 className='text-md'>{ticket.title}</h2>
                            <p className='font-semibold text-lg'>
                              {ticket.value} {ticket.valueType}
                            </p>
                          </div>
                          <div className='flex gap-2 items-center'>
                            <p className='flex items-center justify-center gap-1 w-[40px] font-semibold'>
                              {screen !== 'information' && <span className='font-normal text-text'>x</span>}
                              {countTickets}
                            </p>
                          </div>
                        </div>
                      </Card>
                      <div className='p-4'>
                        <div className='flex gap-4 justify-between items-center'>
                          <p className='text-text text-md'>Total</p>
                          <p className='font-bold text-md'>
                            {ticket.value * countTickets} {ticket.valueType}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className='hidden md:block '>
                  <Card className='p-4 bg-background'>
                    <div className='flex justify-between items-center gap-4'>
                      <div>
                        <h2 className='text-md'>{ticket.title}</h2>
                        <p className='font-semibold text-lg'>
                          {ticket.value} {ticket.valueType}
                        </p>
                      </div>
                      <div className='flex gap-2 items-center'>
                        <p className='flex items-center justify-center gap-1 w-[40px] font-semibold'>
                          {screen !== 'information' && <span className='font-normal text-text'>x</span>}
                          {countTickets}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <div className='p-4'>
                    <div className='flex gap-4 justify-between items-center'>
                      <p className='text-text'>Total</p>
                      <p className='font-bold text-md'>
                        {ticket.value * countTickets} {ticket.valueType}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Section data */}
        <section className='relative flex flex-1 md:flex-auto w-full justify-center md:pr-4'>
          <div className='flex flex-col gap-4 px-4 w-full py-4 max-w-[520px] pt-[80px]'>
            <div className='absolute top-0 left-0 w-full h-[60px] flex justify-center items-center mx-auto  px-4 border-b-[1px] border-border'>
              <div className='w-full max-w-[520px]'>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'information' ? 'text-white' : 'text-text')}>
                        Information
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'payment' ? 'text-white' : 'text-text')}>
                        Payment
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'summary' ? 'text-white' : 'text-text')}>
                        Summary
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            {screen === 'information' && <FormCustomer onSubmit={handleGenerateInvoice} />}

            {screen === 'payment' && <FormPayment invoice={invoice?.bolt11.toUpperCase()} />}

            {screen === 'summary' && (
              <>
                <Card>
                  <div className='flex-1 flex flex-col items-center justify-center gap-4 w-full mx-auto py-12 px-8'>
                    <CreditCardValidationIcon className='w-8 h-8' />
                    <div className='flex flex-col gap-2 text-center'>
                      <h2 className='font-bold text-2xl'>Congratulation!</h2>
                      <p className='text-text'>
                        Your payment has been confirmed. We have sent the event details to your email.
                      </p>
                    </div>
                  </div>
                </Card>
                <Link href='/'>
                  <Button className='w-full' variant='link'>
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
          <AlertDialogHeader className='items-center'>
            <SleepingIcon className='w-8 h-8 color-primary' />
            <AlertDialogTitle className='text-center'>Oops! Try again</AlertDialogTitle>
            <AlertDialogDescription className='text-center'>
              {`It looks like you weren't able to complete the transaction in time.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='flex-1 p-0'>
              <Button className='w-full' variant='secondary' tabIndex={-1}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction className='flex-1'>Try again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LaWalletConfig>
  );
}
