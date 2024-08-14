"use client";

import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface FormPaymentProps {
  invoice?: string;
}

export function FormPayment({ invoice }: FormPaymentProps) {
  return (
    <>
      <div className='flex-1 flex flex-col gap-4'>
        <div className='flex gap-4 items-center justify-end'>
          <p className='text-sm text-text'>Time:</p>
          <div className='flex gap-2 items-center justify-center'>
            <TimeIcon className='w-4 h-4' />
            <span className='font-semibold text-sm'>09:45</span>
          </div>
        </div>

        <div className='flex-1 flex flex-col gap-4 justify-start'>
          <Tabs defaultValue='lightning'>
            <TabsList className='w-full bg-border'>
              <TabsTrigger value='lightning' className='flex-1'>
                Lightning
              </TabsTrigger>
              <TabsTrigger value='onchain' className='flex-1 gap-2' disabled>
                Onchain <Badge>Soon</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value='lightning'>
              <Card className='py-8 md:py-12 bg-white'>
                <div className='max-w-[300px] mx-auto'>
                  {invoice ? (
                    <QRCodeSVG
                      value={invoice}
                      size={300}
                      imageSettings={{
                        // Iso 24x24, image 42x42
                        src: "/iso.png",
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
              </Card>
              <div className='flex gap-2 w-full mt-2'>
                <Button
                  variant='secondary'
                  className='w-full'
                  onClick={() => null}
                >
                  Pay with wallet
                </Button>
                <Button className='w-full' onClick={() => null}>
                  Copy
                </Button>
              </div>
            </TabsContent>
            <TabsContent value='onchain'>
              <Card>
                <CardHeader>
                  <CardTitle>Bitcoin Onchain</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit, amet consectetur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='max-w-[300px] mx-auto'>
                    <Skeleton className='w-[300px] h-[300px]' />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className='flex gap-2 w-full justify-center'>
                    <p className='text-text text-sm'>Service not available.</p>
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

function TimeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='20'
      height='20'
      color='currentColor'
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
  );
}
