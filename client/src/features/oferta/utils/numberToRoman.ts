export function numberToRoman(num: number) {
  if (num < 1 || num > 3999) {
    throw new Error('Input integer limited to 1 through 3,999');
  }

  const values: number[] = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals: string[] = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

  let result = '';

  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }

  return result;
}
