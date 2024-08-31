import { Event, validateEvent, verifyEvent } from 'nostr-tools';
import { z } from 'zod';

const tagSchema = z.tuple([z.string(), z.string()]);

export const contentSchema = z.object({
  limit: z.number().int(),
  checked_in: z.boolean().optional(),
  ticket_id: z.string().optional(),
  email: z.string().optional(),
});

export const orderEventSchema = z.object({
  kind: z.literal(27242),
  tags: z.array(z.never()),
  content: z.string().refine(
    (data) => {
      try {
        const parsed = JSON.parse(data);
        console.log('parsed', parsed);
        // contentSchema.parse(parsed);
        return true;
      } catch (error: any) {
        console.log('error', error);
        return false;
      }
    },
    {
      message: 'Invalid content format',
    }
  ),
  created_at: z.number().int().positive({ message: 'Invalid timestamp' }),
  pubkey: z.string().length(64, { message: 'Invalid public key' }),
  id: z.string().length(64, { message: 'Invalid ID' }),
  sig: z.string().length(128, { message: 'Invalid signature' }),
});

export function validateOrderEvent(
  orderEvent: Event,
  adminPublicKey: string
): boolean {
  const isValidEvent = validateEvent(orderEvent);

  if (!isValidEvent) {
    return false;
  }

  const isVerifyEvent = verifyEvent(orderEvent);

  if (!isVerifyEvent) {
    return false;
  }

  if (orderEvent.pubkey !== adminPublicKey) {
    return false;
  }

  return true;
}
