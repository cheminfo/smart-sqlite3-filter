/**
 *
 * @param string
 */
export function trimQuotes(string: string) {
  if (string.startsWith('"') && string.endsWith('"')) {
    return string.slice(1, -1);
  } else if (string.startsWith("'") && string.endsWith("'")) {
    return string.slice(1, -1);
  }
  return string;
}
