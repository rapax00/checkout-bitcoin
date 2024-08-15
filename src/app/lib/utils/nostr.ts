import { Event, EventTemplate, finishEvent, getPublicKey } from 'nostr-tools';

function generateZapRequest(
  orderId: string,
  amountSats: number,
  nostrPubkey: string
): Event {
  const unsignedZapRequest: EventTemplate = {
    kind: 9734,
    tags: [
      ['p', nostrPubkey],
      ['amount', amountSats.toString()],
      ['relays', 'wss://relay.lawallet.ar', 'wss://nostr-pub.wellorder.net'],
      ['e', orderId],
    ] as string[][],
    content: '',
    created_at: Math.round(Date.now() / 1000),
  };

  const privateKey = process.env.SIGNER_PRIVATE_KEY!;

  const zapRequest: Event = finishEvent(unsignedZapRequest, privateKey);

  return zapRequest;
}

export { generateZapRequest };
