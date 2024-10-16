import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderUserData } from '@/types/orders';
import { CircleCheck, CircleDashed, CircleX } from 'lucide-react';

const MAX_TICKETS = parseInt(process.env.NEXT_MAX_TICKETS || '0', 10); // Get the max tickets from env

interface FormCustomerProps {
  onSubmit: (data: OrderUserData) => void;
  discountMultiple: number;
  isCodeLoading: boolean;
  setCode: (code: string) => void;
}

export function FormCustomer({
  onSubmit,
  discountMultiple,
  isCodeLoading,
  setCode,
}: FormCustomerProps) {
  // Form
  const [fullname, setFullname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newsletter, setNewsletter] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeStatus, setCodeStatus] = useState<string>(''); // 'valid', 'invalid', or 'loading'
  const [maxTicketsReached, setMaxTicketsReached] = useState<boolean>(false);

  // Check total tickets in the database on component mount
  useEffect(() => {
    const checkTickets = async () => {
      try {
        const response = await fetch('/api/ticket/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${errorData.errors || response.statusText}`);
        }

        const data = await response.json();

        if (response.ok) {
          if (data.data.totalTickets >= MAX_TICKETS) {
            setMaxTicketsReached(true);
          }
        } else {
          console.error('Failed to fetch total tickets:', data.error);
        }

        console.log('setMaxTicketsReached', maxTicketsReached);
      } catch (error) {
        console.error('Error fetching total tickets:', error);
      }
    };

    checkTickets();
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    // Insert data if not exist
    const data = {
      fullname,
      email,
      newsletter,
    };

    const status = 200;

    if (status && status === 200) {
      onSubmit(data);
    } else {
      setMessage('Hubo un error al registrar el cliente.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCodeLoading) {
      setCodeStatus('loading');
    } else {
      setCodeStatus(discountMultiple != 1 ? 'valid' : 'invalid');
    }
  }, [isCodeLoading, discountMultiple]);

  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Information</h2>
          <p className="text-text">
            Completá la información para recibir tu entrada.
          </p>
        </div>
        <Card className="p-6">
          <div className="flex flex-col flex-1 justify-start">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="fullname"
                    name="fullname"
                    minLength={3}
                    placeholder="Your alias"
                    required
                    onChange={(e) => setFullname(e.target.value)}
                    defaultValue={fullname}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your real mail"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={email}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="code">Code</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      placeholder="Code"
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {codeStatus !== '' && (
                        <>
                          {codeStatus === 'valid' && (
                            <span className="text-green-500">
                              <CircleCheck />
                            </span>
                          )}
                          {codeStatus === 'invalid' && (
                            <span className="text-red-500">
                              <CircleX />
                            </span>
                          )}
                          {codeStatus === 'loading' && (
                            <span className="text-gray-500">
                              <CircleDashed />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="items-top flex space-x-2 mt-2">
                  <Checkbox
                    id="newsletter"
                    onCheckedChange={() => setNewsletter(!newsletter)}
                    checked={newsletter}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="newsletter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to the newsletter
                    </label>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading || maxTicketsReached}>
                {loading ? 'Generando ticket' : 'Confirm order'}
              </Button>
              {maxTicketsReached && (
                <p className="text-red-500 text-sm">
                  Maximum number of tickets reached.
                </p>
              )}
            </form>
            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
