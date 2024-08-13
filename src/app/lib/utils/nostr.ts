import { Event, EventTemplate, finalizeEvent, getPublicKey } from "nostr-tools";

function generateZapRequest(
  orderId: string,
  amountSats: number,
  nostrPubkey: string
): Event {
  const unsignedZapRequest: EventTemplate = {
    kind: 9734,
    tags: [
      ["p", nostrPubkey],
      ["amount", amountSats.toString()],
      ["relays", "wss://relay.lawallet.ar", "wss://nostr-pub.wellorder.net"],
      ["e", orderId],
    ] as string[][],
    content: "",
    created_at: Math.round(Date.now() / 1000),
  };

  const privateKey = Uint8Array.from(
    Buffer.from(process.env.SIGNER_PRIVATE_KEY!, "hex")
  );
  const zapRequest: Event = finalizeEvent(unsignedZapRequest, privateKey);

  return zapRequest;
}

export { generateZapRequest };
