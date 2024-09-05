import axios from 'axios';

const urlYadio = 'https://api.yadio.io/exrates/ARS';

async function getBtcPrice(): Promise<number> {
  return await axios.get(urlYadio).then((res) => {
    return res.data.BTC;
  });
}

async function convertArsToMiliSats(priceArs: number): Promise<number> {
  return Math.round((priceArs / (await getBtcPrice())) * 100000000000);
}

async function calculateTicketPrice(
  qty: number,
  ticketPriceArs: number
): Promise<number> {
  const ticketPriceSats: number = await convertArsToMiliSats(ticketPriceArs);

  const totalTicketPriceSats: number = qty * ticketPriceSats;

  return totalTicketPriceSats;
}

export { calculateTicketPrice };
