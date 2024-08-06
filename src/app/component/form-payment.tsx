'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function FormPayment({ invoice }: any) {
  const [countTickets, setCountTickets] = useState<number>(1);
  const [screen, setScreen] = useState<string>('information');

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
    setScreen('payment');
  };

  return (
    <>
      <div className='flex-1 flex flex-col gap-4'>
        <div className='flex gap-4 items-center justify-end'>
          {/* <div className='flex flex-col gap-2'>
                    <h2 className='font-bold text-2xl'>Payment</h2>
                    <p className='text-gray-500'>Lorem ipsum dolor sit, amet consectetur</p>
                  </div> */}
          <p className='text-sm text-gray-500'>Time: </p>
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
    </>
  );
}
