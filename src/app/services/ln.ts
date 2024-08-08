import { EventTemplate } from "nostr-tools";

async function generateInvoice(
  callbackUrl: string,
  amount: number,
  zapEvent?: EventTemplate
): Promise<string> {
  let url = `${callbackUrl}?amount=${amount}`;

  if (zapEvent) {
    const encodedZapEvent = encodeURI(JSON.stringify(zapEvent));

    url += `&nostr=${encodedZapEvent}&lnurl=1`;
  }

  return ((await (await fetch(url)).json()) as any).pr as string;
}

async function getCallbackUrlFromWalias(walias: string) {
  const name = walias.split("@")[0];
  const domain = walias.split("@")[1];

  const url = `https://${domain}/.well-known/lnurlp/${name}`;

  return (await (await fetch(url)).json()).callback as string;
}

export { generateInvoice, getCallbackUrlFromWalias };
