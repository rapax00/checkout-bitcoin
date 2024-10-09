export const codes: { [key: string]: number } = {
  // <code>: <discount percentage>
  rapax: 10,
  lacrypta: 21,
  gorila: 5,
};

export function getCodeDiscount(code: string) {
  if (codes[code]) {
    return (100 - codes[code]) / 100;
  }
  return 1;
}
