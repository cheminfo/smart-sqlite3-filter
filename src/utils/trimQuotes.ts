/**
 * Remove single or double quotes from the beginning and end of a string.
 * @param string - The string to trim
 * @returns The string without quotes
 */
export function trimQuotes(string: string): string {
  if (string.startsWith('"') && string.endsWith('"')) {
    return string.slice(1, -1);
  } else if (string.startsWith("'") && string.endsWith("'")) {
    return string.slice(1, -1);
  }
  return string;
}
