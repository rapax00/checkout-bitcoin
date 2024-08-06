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
import { FormCustomer } from './component/form-customer';
import { FormPayment } from './component/form-payment';

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

function CreditCardValidationIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='24'
      height='24'
      color='currentColor'
      fill='none'
    >
      <path
        d='M15 7.5C15 7.5 15.5 7.5 16 8.5C16 8.5 17.5882 6 19 5.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M22 7C22 9.76142 19.7614 12 17 12C14.2386 12 12 9.76142 12 7C12 4.23858 14.2386 2 17 2C19.7614 2 22 4.23858 22 7Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M3.60746 21.0095L4.07229 20.4209L3.60746 21.0095ZM3.0528 20.4875L3.61262 19.9884L3.0528 20.4875ZM20.9472 20.4875L20.3874 19.9884L20.9472 20.4875ZM20.3925 21.0095L19.9277 20.4209L20.3925 21.0095ZM3.60746 6.99127L3.14263 6.40268L3.60746 6.99127ZM3.0528 7.5133L3.61262 8.0124L3.0528 7.5133ZM22.75 13.2445C22.7493 12.8302 22.4129 12.495 21.9987 12.4958C21.5845 12.4965 21.2493 12.8329 21.25 13.2471L22.75 13.2445ZM9.06582 6.75292C9.48003 6.75057 9.81391 6.41289 9.81157 5.99869C9.80922 5.58448 9.47154 5.2506 9.05734 5.25294L9.06582 6.75292ZM13.5 21.2504H10.5V22.7504H13.5V21.2504ZM10.5 21.2504C8.60311 21.2504 7.24353 21.2493 6.19895 21.1313C5.16816 21.0148 4.54359 20.7931 4.07229 20.4209L3.14263 21.5981C3.926 22.2168 4.86842 22.4905 6.03058 22.6218C7.17896 22.7515 8.63832 22.7504 10.5 22.7504V21.2504ZM1.25 14.0004C1.25 15.7493 1.24857 17.1321 1.38762 18.2226C1.52932 19.3337 1.82681 20.2394 2.49298 20.9866L3.61262 19.9884C3.22599 19.5547 2.99708 18.9856 2.87558 18.0328C2.75143 17.0593 2.75 15.789 2.75 14.0004H1.25ZM4.07229 20.4209C3.90545 20.2892 3.7517 20.1444 3.61262 19.9884L2.49298 20.9866C2.69068 21.2084 2.90811 21.4129 3.14263 21.5981L4.07229 20.4209ZM21.25 14.0004C21.25 15.789 21.2486 17.0593 21.1244 18.0328C21.0029 18.9856 20.774 19.5547 20.3874 19.9884L21.507 20.9866C22.1732 20.2394 22.4707 19.3337 22.6124 18.2226C22.7514 17.1321 22.75 15.7493 22.75 14.0004H21.25ZM13.5 22.7504C15.3617 22.7504 16.821 22.7515 17.9694 22.6218C19.1316 22.4905 20.074 22.2168 20.8574 21.5981L19.9277 20.4209C19.4564 20.7931 18.8318 21.0148 17.801 21.1313C16.7565 21.2493 15.3969 21.2504 13.5 21.2504V22.7504ZM20.3874 19.9884C20.2483 20.1444 20.0946 20.2892 19.9277 20.4209L20.8574 21.5981C21.0919 21.4129 21.3093 21.2084 21.507 20.9866L20.3874 19.9884ZM2.75 14.0004C2.75 12.2118 2.75143 10.9415 2.87558 9.96799C2.99708 9.01519 3.22599 8.44606 3.61262 8.0124L2.49298 7.0142C1.82681 7.76141 1.52932 8.66709 1.38762 9.77825C1.24857 10.8687 1.25 12.2515 1.25 14.0004H2.75ZM3.14263 6.40268C2.90811 6.58789 2.69068 6.79245 2.49298 7.0142L3.61262 8.0124C3.7517 7.8564 3.90545 7.71161 4.07229 7.57986L3.14263 6.40268ZM22.75 14.0004C22.75 13.7412 22.7504 13.4875 22.75 13.2445L21.25 13.2471C21.2504 13.4885 21.25 13.7376 21.25 14.0004H22.75ZM9.05734 5.25294C7.64978 5.26091 6.50411 5.29333 5.56558 5.44144C4.61301 5.59178 3.81862 5.86882 3.14263 6.40268L4.07229 7.57986C4.47956 7.25822 5.00124 7.04907 5.79942 6.92311C6.61164 6.79492 7.65139 6.76092 9.06582 6.75292L9.05734 5.25294Z'
        fill='currentColor'
      />
      <path
        d='M10 18H11.5'
        stroke='currentColor'
        strokeWidth='1.5'
        stroke-miterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.5 18L18 18'
        stroke='currentColor'
        strokeWidth='1.5'
        stroke-miterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M2.5 11H10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function MinusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='16'
      height='16'
      color='currentColor'
      fill='none'
    >
      <path d='M20 12L4 12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='16'
      height='16'
      color='currentColor'
      fill='none'
    >
      <path d='M12 4V20M20 12H4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function SleepingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='24'
      height='24'
      color='currentColor'
      fill='none'
    >
      <path
        d='M13 2.04938C12.6711 2.01672 12.3375 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.3151 21.9311 10.6462 21.8 10'
        stroke='currentColor'
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
      <path
        d='M10 11H8.70711C8.25435 11 7.82014 10.8201 7.5 10.5M14 11H15.2929C15.7456 11 16.1799 10.8201 16.5 10.5'
        stroke='currentColor'
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
      <circle
        cx='12'
        cy='16'
        r='2'
        stroke='currentColor'
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
      <path
        d='M17 2H19.9474C20.5675 2 20.8775 2 20.9601 2.20009C21.0427 2.40019 20.8317 2.64023 20.4098 3.1203L17.9846 5.8797C17.5627 6.35977 17.3517 6.59981 17.4343 6.79991C17.5169 7 17.8269 7 18.447 7H21'
        stroke='currentColor'
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
    </svg>
  );
}
