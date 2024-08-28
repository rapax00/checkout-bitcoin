import { Event } from "nostr-tools";

async function generateInvoice(
  callbackUrl: string,
  amount: number,
  zapEvent?: Event
): Promise<string> {
  let url = `${callbackUrl}?amount=${amount}`;

  if (zapEvent) {
    const encodedZapEvent = encodeURI(JSON.stringify(zapEvent));

    url += `&nostr=${encodedZapEvent}&lnurl=lnurl`;
  }

  return ((await (await fetch(url)).json()) as any).pr as string;
}

async function getLnurlpFromWalias(walias: string): Promise<any> {
  const name = walias.split("@")[0];
  const domain = walias.split("@")[1];

  const url = `https://${domain}/.well-known/lnurlp/${name}`;

  return await (await fetch(url)).json();
}

export { generateInvoice, getLnurlpFromWalias };
