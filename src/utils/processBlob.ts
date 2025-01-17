import { parseString } from 'dynamic-typing';

import type { Parameter, QueryCriterium } from '../types/QueryCriterium';

import type {
  Values,
  AppendSQLForCriteriaOptions,
} from './appendSQLForCriteria';
import { processBoolean } from './processBoolean';
import { processNumber } from './processNumber';
import { processText } from './processText';

export function processBlob(
  parameter: Parameter,
  criterium: QueryCriterium,
  values: Values,
  options: AppendSQLForCriteriaOptions,
) {
  const { logger } = options;
  const joinOperator = 'OR';

  const sqls = [];
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = parseString(criterium.values[valueIndex]);

    let sql;
    switch (typeof value) {
      case 'string':
        sql = processText(
          parameter,
          getCriteriumWithOneValue(criterium, valueIndex),
          values,
        );
        break;
      case 'number':
        sql = processNumber(
          parameter,
          getCriteriumWithOneValue(criterium, valueIndex),
          values,
          options,
        );
        break;
      case 'boolean':
        sql = processBoolean(
          parameter,
          getCriteriumWithOneValue(criterium, valueIndex),
          values,
          options,
        );
        break;
      default:
        logger?.info(`Invalid value for BLOB: ${criterium.values[valueIndex]}`);
        continue;
    }
    if (!sql) {
      continue;
    }
    sqls.push(sql);
  }
  if (sqls.length === 0) {
    return '';
  }
  return `(${sqls.join(` ${joinOperator} `)})`;
}
function getCriteriumWithOneValue(criterium: QueryCriterium, index: number) {
  return {
    ...criterium,
    values: [criterium.values[index]],
  };
}
