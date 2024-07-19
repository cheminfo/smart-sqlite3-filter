import { QueryCriterium } from './QueryCriterium';
import { splitString } from './splitString';
import { trimQuotes } from './trimQuotes';

/**
 *
 * @param string
 * @returns array of query criteria
 */
export function parseQueryString(string: string): QueryCriterium[] {
  const tokens = splitString(string);
  const queryCriteria = [];
  let index = 0;
  for (let token of tokens) {
    let negate = false;
    if (token.startsWith('-')) {
      negate = true;
      token = token.slice(1);
    }
    const colon = token.indexOf(':');
    const fields = [];
    if (colon > -1) {
      fields.push(...token.slice(0, colon).split(','));
      token = token.slice(colon + 1);
    }
    let operator = '';
    const operatorMatch = token.match(/^(=|<>|!=|<=|<|>=|>|~|\$|\^)/);
    if (operatorMatch) {
      operator = operatorMatch[0];
      token = token.slice(operator.length);
    }
    if (token.includes('..')) {
      operator = '..';
    }

    const values = splitString(token, { delimiter: ',' });
    token = trimQuotes(token);
    queryCriteria.push({ fields, operator, values, negate, index: index++ });
  }

  // if no values we wkip
  return queryCriteria.filter((criterium) => criterium.values.length > 0);
}
