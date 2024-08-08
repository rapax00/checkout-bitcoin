import { EventTemplate } from "nostr-tools";
import signer from "@/app/services/signer";

function generateZapRequest(
  orderId: string,
  amountSats: number
): EventTemplate {
  const unsignedZapRequest: EventTemplate = {
    kind: 9734,
    content: "",
    created_at: Math.round(Date.now() / 1000),
    tags: [
      ["p", signer.getPublicKey()],
      ["e", orderId],
      ["amount", (amountSats * 1000).toString()],
      ["relays", "wss://relay.lawallet.ar"],
      ["lnurl", "lnurl"],
    ] as string[][],
  };

  return unsignedZapRequest;
}

export { generateZapRequest };
