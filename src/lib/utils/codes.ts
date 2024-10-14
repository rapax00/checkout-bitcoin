export const codes: { [key: string]: number } = JSON.parse(
  process.env.NEXT_DISCOUNT_CODES || '{}'
);

export function getCodeDiscount(code: string) {
  if (codes[code]) {
    return (100 - codes[code]) / 100;
  }
  return 1;
}
