'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const [countTickets, setCountTickets] = useState<number>(1);
  const [screen, setScreen] = useState<string>('information');

  const [invoice, setInvoice] = useState<string>('');

  // Mock data
  const ticket = {
    title: 'Ticket #1',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit impedit aperiam, optio dolores tenetur earum.',
    imageUrl: 'https://placehold.co/400',
    value: 5000,
    valueType: 'SAT',
  };

  const handleGenerateInvoice = () => {
    setTimeout(() => {
      setInvoice(
        'lnbc10n1pn2cyxapp5qdx443yd2d9gysjyvu7t2wngca65kkx86yyfn3yzny7xr6z6v56sdqqcqzzsxqyz5vqsp5zh8rturaahxcf0aju8en87dzprx8vffp4eznf9v4pqjta4x9y4zq9qyyssq2q7439hp9gxaccty7ny46xdvh46rh9p8s4g9djugmxukd3dxk6u95fy7q45vltq56dcy0lwwu7mlczcfzjdfdnhsda5828599gfmljqq7v963x',
      );
    }, 300);
    setScreen('payment');
  };

  return (
    <>
      <div className='flex flex-col md:flex-row w-full min-h-[100dvh]'>
        {/* Aside info */}
        <aside className='bg-gray-100 relative flex justify-center items-center w-full min-h-full pt-[60px] md:pt-0'>
          <nav className='absolute top-0 left-0 w-full h-[60px]'>
            <div className='flex gap-2 px-4 w-full max-w-[520px] h-full items-center justify-between mx-auto'>
              <Link href='/'>
                <img src='https://placehold.co/120x50' alt='' width={120} height={50} />
              </Link>
              <div className='h-full flex items-center gap-2 ml-4'>
                <Select defaultValue='SAT'>
                  <SelectTrigger className='w-auto'>
                    <SelectValue placeholder='Price' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SAT'>SAT</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='ARS'>ARS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </nav>
          <div className='w-full max-w-[520px] my-4 px-4'>
            <Card className='p-4'>
              <div className='flex justify-between items-center gap-4'>
                <div>
                  <h2 className='text-md'>{ticket.title}</h2>
                  <p className='font-semibold text-lg'>
                    {ticket.value} {ticket.valueType}
                  </p>
                </div>
                <div className='flex gap-2 items-center'>
                  {screen === 'information' && (
                    <Button
                      variant={screen !== 'information' || countTickets === 1 ? 'ghost' : 'outline'}
                      size='icon'
                      onClick={() => setCountTickets(countTickets - 1)}
                      disabled={screen !== 'information' || countTickets === 1}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        width='16'
                        height='16'
                        color='currentColor'
                        fill='none'
                      >
                        <path
                          d='M20 12L4 12'
                          stroke='currentColor'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </svg>
                    </Button>
                  )}
                  <p className='flex items-center justify-center gap-2 w-[40px] font-semibold'>
                    {screen !== 'information' && <span className='font-normal text-xs text-gray-500'>x</span>}
                    {countTickets}
                  </p>
                  {screen === 'information' && (
                    <Button
                      variant={screen !== 'information' ? 'ghost' : 'outline'}
                      size='icon'
                      onClick={() => setCountTickets(countTickets + 1)}
                      disabled={screen !== 'information'}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        width='16'
                        height='16'
                        color='currentColor'
                        fill='none'
                      >
                        <path
                          d='M12 4V20M20 12H4'
                          stroke='currentColor'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
              {screen === 'information' && <p className='mt-2 text-sm text-gray-500'>{ticket.description}</p>}
            </Card>
            <div className='p-4'>
              {screen === 'information' && (
                <>
                  <div className='flex gap-4 justify-between items-center'>
                    <div className='flex gap-4 items-center'>
                      <p className='text-gray-500'>Subtotal</p>
                      <Button variant='link' size='sm'>
                        Agregar cupon
                      </Button>
                    </div>
                    <p className='font-bold text-md'>$10.000</p>
                  </div>
                  <hr className='my-4 border-gray-300' />
                </>
              )}
              <div className='flex gap-4 justify-between items-center'>
                <p className='text-gray-500'>Total</p>
                <p className='font-bold text-md'>
                  {ticket.value * countTickets} {ticket.valueType}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Section data */}
        <section className='bg-white relative flex flex-1 md:flex-auto w-full justify-center md:pr-4'>
          <div className='flex flex-col gap-4 px-4 w-full py-4 max-w-[520px] pt-[80px]'>
            <div className='absolute top-0 left-0 w-full h-[60px] flex justify-center items-center mx-auto  px-4 border-b-[1px] border-gray-200'>
              <div className='w-full max-w-[520px]'>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'information' ? 'text-gray-700' : 'text-gray-400')}>
                        Information
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'payment' ? 'text-gray-700' : 'text-gray-400')}>
                        Payment
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={cn('', screen === 'summary' ? 'text-gray-700' : 'text-gray-400')}>
                        Summary
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            {screen === 'information' && (
              <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <h2 className='font-bold text-2xl'>Information</h2>
                  <p className='text-gray-500'>Lorem ipsum dolor sit, amet consectetur</p>
                </div>
                <Card className='p-6'>
                  <div className='flex flex-col flex-1 justify-start'>
                    <form onSubmit={() => null} className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor='name'>Name</Label>
                          <Input type='text' id='name' name='name' placeholder='Satoshi Nakamoto' />
                        </div>
                        {/* <div className='mt-4 mb-2'>
                          <h3 className='font-bold'>Contact</h3>
                        </div> */}
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor='email'>Email</Label>
                          <Input type='email' id='email' name='email' placeholder='satoshi@gmail.com' />
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                          <Checkbox id='newsletter' checked />
                          <Label htmlFor='newsletter'>Subscribe to the newsletter</Label>
                        </div>
                        {/* <div className='flex items-center gap-2 mt-1'>
                          <Checkbox id='terms' />
                          <Label htmlFor='terms'>Accept terms and conditions</Label>
                        </div> */}
                      </div>
                      <Button onClick={handleGenerateInvoice}>Confirm order</Button>
                    </form>
                  </div>
                </Card>
              </div>
            )}

            {screen === 'payment' && (
              <div className='flex-1 flex flex-col gap-4'>
                <div className='flex gap-4 items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    <h2 className='font-bold text-2xl'>Payment</h2>
                    <p className='text-gray-500'>Lorem ipsum dolor sit, amet consectetur</p>
                  </div>
                  <div className='flex gap-2 items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='20'
                      height='20'
                      color='bg-gray-50'
                      fill='none'
                    >
                      <circle cx='12' cy='12' r='10' stroke='currentColor' stroke-width='1.5' />
                      <path
                        d='M12 8V12L14 14'
                        stroke='currentColor'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                    <span className='font-semibold'>09:45</span>
                  </div>
                </div>

                <div className='flex-1 flex flex-col gap-4 justify-start'>
                  <Tabs defaultValue='lightning'>
                    <TabsList className='w-full'>
                      <TabsTrigger value='lightning' className='flex-1'>
                        Lightning
                      </TabsTrigger>
                      <TabsTrigger value='onchain' className='flex-1 gap-2' disabled>
                        Onchain <Badge>Soon</Badge>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value='lightning'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Lightning Network</CardTitle>
                          <CardDescription>Lorem ipsum dolor sit, amet consectetur</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='max-w-[300px] mx-auto'>
                            {invoice ? (
                              <QRCodeSVG
                                value={invoice}
                                size={300}
                                imageSettings={{
                                  src: 'https://placehold.co/42x42',
                                  x: undefined,
                                  y: undefined,
                                  height: 42,
                                  width: 42,
                                  excavate: true,
                                }}
                              />
                            ) : (
                              <Skeleton className='w-[300px] h-[300px]' />
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className='flex gap-2 w-full'>
                            <Button variant='secondary' className='w-full' onClick={() => null}>
                              Pay with wallet
                            </Button>
                            <Button className='w-full' onClick={() => setScreen('summary')}>
                              Copy
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value='onchain'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Bitcoin Onchain</CardTitle>
                          <CardDescription>Lorem ipsum dolor sit, amet consectetur</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='max-w-[300px] mx-auto'>
                            <Skeleton className='w-[300px] h-[300px]' />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className='flex gap-2 w-full justify-center'>
                            <p className='text-gray-500 text-sm'>Service not available.</p>
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}

            {screen === 'summary' && (
              <>
                <div className='relative z-1 flex-1 flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h2 className='font-bold text-2xl'>Summary</h2>
                    <p className='text-gray-500'>Lorem ipsum dolor sit, amet consectetur</p>
                  </div>
                  <div className='flex flex-col flex-1 justify-start'>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe at provident autem fugit iste quo
                      quae numquam quibusdam quam et nemo doloremque expedita debitis vitae reiciendis id veniam, neque
                      sapiente.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
