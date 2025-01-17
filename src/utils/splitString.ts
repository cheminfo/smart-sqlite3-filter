import { trimQuotes } from './trimQuotes';

/**
 * Split a string by a delimiter, but ignore delimiters inside quotes.
 * @param string - The string to split
 * @param [options={}] - Options
 * @param [options.delimiter=/\s/] - The delimiter to split by
 * @returns An array of strings
 */
export function splitString(
  string: string,
  options: { delimiter?: string | RegExp } = {},
): string[] {
  const { delimiter = /\s/ } = options;
  const results = [];
  let inQuotes = false;
  let start = 0;
  let quote = '';
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    if (inQuotes) {
      if (char === quote) {
        inQuotes = false;
        quote = '';
      }
    } else if (char === '"' || char === "'") {
      inQuotes = true;
      quote = char;
    } else if (char.match(delimiter) && !inQuotes) {
      results.push(string.slice(start, i).trim());
      start = i + 1;
    }
    if (i === string.length - 1) {
      results.push(string.slice(start).trim());
    }
  }
  return results.filter(Boolean).map((result) => {
    return trimQuotes(result);
  });
}
