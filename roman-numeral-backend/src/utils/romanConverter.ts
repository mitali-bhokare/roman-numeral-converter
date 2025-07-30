// Roman numeral rules based on: https://en.wikipedia.org/wiki/Roman_numerals
export function toRoman(num: number): string {
  if (num == null) {
    throw new Error('Input must not be null or undefined');
  }
  if (typeof num !== 'number') {
    throw new Error('Input must be a number');
  }

  if (!Number.isInteger(num)) {
    throw new Error('Only integer values are allowed');
  }

  if (num < 1 || num > 3999) {
    throw new Error('Number must be between 1 and 3999');
  }

  const map: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];

  let result = '';
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

