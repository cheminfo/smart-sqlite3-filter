import type { Parameter, QueryCriterium } from '../types/QueryCriterium';
import type { Schema } from '../types/Schema';

import { splitString } from './splitString';
import { trimQuotes } from './trimQuotes';

interface ParseQueryStringOptions {
  fieldsAliases?: Record<string, string[]>;
  defaultFields?: string[];
}

/**
 *
 * @param string
 * @param schema
 * @param options
 * @returns array of query criteria
 */
export function parseQueryString(
  string: string,
  schema: Schema,
  options: ParseQueryStringOptions = {},
): QueryCriterium[] {
  const {
    fieldsAliases = {},
    defaultFields = Object.values(schema)
      .filter((column) => column.type !== 'BLOB')
      .map((column) => column.name),
  } = options;

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
    const parameters =
      colon === -1
        ? getParameters(defaultFields, schema, fieldsAliases)
        : getParameters(
            token.slice(0, colon).split(','),
            schema,
            fieldsAliases,
          );
    if (colon >= 0) {
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
    queryCriteria.push({
      parameters,
      operator,
      values,
      negate,
      index: index++,
    });
  }
  // if no values
  return queryCriteria.filter((criterium) => criterium.values.length > 0);
}

function getParameters(
  parts: string[],
  schema: Schema,
  fieldsAliases: Record<string, string[]>,
): Parameter[] {
  parts = parts.map((part) => part.trim());
  const parameters = [];
  for (const part of parts) {
    const jpaths = fieldsAliases[part] || [part];
    for (const jpath of jpaths) {
      const parts = jpath.split('.');
      if (parts.length === 1) {
        if (!schema[jpath]) {
          throw new Error(`Field ${jpath} does not exist in the schema`);
        }
        const type = schema[jpath].type;
        if (type === 'BLOB') {
          throw new Error(`Field ${jpath} is a BLOB, you need to use jpath`);
        }
        parameters.push({
          column: jpath,
          type,
          jpath,
          accessor: jpath,
          isJpath: false,
        });
      } else {
        const column = parts[0];
        if (!schema[column]) {
          throw new Error(`Field ${column} does not exist in the schema`);
        }
        const type = schema[column].type;
        if (type !== 'BLOB') {
          throw new Error(`Field ${column} is not a BLOB, you can't use jpath`);
        }
        // check type is    const column = schema[field];
        const accessor = `${parts[0]} ->> '$.${parts.slice(1).join('.')}'`;
        parameters.push({ column, accessor, type, jpath, isJpath: true });
      }
    }
  }

  return parameters;
}
