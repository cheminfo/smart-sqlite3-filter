/**
 * Will return the range for a number that allows to consider
 * that the last digit is not significant
 * @param value - the number as a string in order to keep the precision
 * @returns the range
 */
export function getNumberRange(value: string): { min: number; max: number } {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return { min: Number.NaN, max: Number.NaN };
  }
  const [coefficient, power = 0] = value.toLowerCase().split('e');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [integer, decimal = ''] = coefficient.split('.');
  const error = 10 ** (-decimal.length + Number(power)) / 2;
  return { min: number - error, max: number + error };
}
