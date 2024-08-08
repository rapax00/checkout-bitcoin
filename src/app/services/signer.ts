import {
  type EventTemplate,
  type NostrEvent,
  finalizeEvent,
  getPublicKey,
} from "nostr-tools";
import { Signer } from "../types/signer";

// Gets private key from environment
const privateKey = Uint8Array.from(
  Buffer.from(process.env.SIGNER_PRIVATE_KEY!, "hex")
);

// Gets public key from private key
const publicKey = getPublicKey(privateKey);

const signer: Signer = {
  getPublicKey: () => {
    return publicKey;
  },

  signEvent: (event: EventTemplate): NostrEvent => {
    return finalizeEvent(event, privateKey);
  },
};

export default signer;
