export const toInt = (v: string) => parseInt(v, 10);
export const sumReducer = (sum: number, x: string | number): number =>
  (sum += toInt(`${x}`));
