import { useState, useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { supabase } from '@/config/db';

const fetchData = async (email: string) => {
  const { data, error } = await supabase.from('customer').select('*').eq('email', email);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data.length > 0 ? data[0] : null;
};

const insertData = async (value: any) => {
  const { name, email, newsletter } = value;

  const { error } = await supabase.from('customer').insert({ name, email, newsletter });

  if (error) {
    console.error('Error inserting data:', error);
    return { error };
  }

  return {
    status: 200,
  };
};

export function FormCustomer({ onSubmit }: any) {
  // Form
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newsletter, setNewsletter] = useState<boolean>(false);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    // onSubmit();
    // return null;

    // Verify email
    const existingCustomer = await fetchData(email);

    if (existingCustomer) {
      setMessage('El correo electrónico ya está registrado.');
      setLoading(false);
      return;
    } else {
      // Insert data if not exist
      const data = {
        name,
        email,
        newsletter,
      };

      const { status } = await insertData(data);

      if (status && status === 200) {
        onSubmit();
      } else {
        setMessage('Hubo un error al registrar el cliente.');
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className='flex-1 flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <h2 className='font-bold text-2xl'>Information</h2>
          <p className='text-gray-500'>Lorem ipsum dolor sit, amet consectetur</p>
        </div>
        <Card className='p-6'>
          <div className='flex flex-col flex-1 justify-start'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    type='text'
                    id='name'
                    name='name'
                    placeholder='Satoshi Nakamoto'
                    required
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={name}
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    type='email'
                    id='email'
                    name='email'
                    placeholder='satoshi@gmail.com'
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={email}
                  />
                </div>
                <div className='items-top flex space-x-2 mt-2'>
                  <Checkbox id='newsletter' onCheckedChange={() => setNewsletter(!newsletter)} checked={newsletter} />
                  <div className='grid gap-1.5 leading-none'>
                    <label
                      htmlFor='newsletter'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      Subscribe to the newsletter
                    </label>
                    <p className='text-sm text-muted-foreground'>
                      You agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
              <Button type='submit' disabled={loading}>
                {loading ? 'Generando ticket' : 'Confirm order'}
              </Button>
            </form>
            {message && <p className='text-center text-sm mt-2'>{message}</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
