import type { Parameter, QueryCriterium } from '../types/QueryCriterium';

import type {
  Values,
  AppendSQLForCriteriaOptions,
} from './appendSQLForCriteria';
import { getNumberRange } from './getNumberRange';

export function processNumber(
  parameter: Parameter,
  criterium: QueryCriterium,
  values: Values,
  options: AppendSQLForCriteriaOptions,
) {
  const { logger } = options;
  const operator = criterium.operator || '~';
  const sqls = [];
  const column = parameter.column;
  const accessor = parameter.accessor;
  let joinOperator = 'OR';
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];
    // is it really a number ? We should skip otherwise
    if (operator !== '..' && Number.isNaN(Number(value))) {
      continue;
    }
    const valueFieldName = `${column}_${criterium.index}_${valueIndex}`;

    switch (operator) {
      case '~':
        {
          // we consider by default that a number is not exact by default
          const { min, max } = getNumberRange(value);
          values[`${valueFieldName}_min`] = min;
          values[`${valueFieldName}_max`] = max;
          sqls.push(
            `${accessor} BETWEEN :${valueFieldName}_min AND :${valueFieldName}_max`,
          );
        }
        break;
      case '=':
        values[valueFieldName] = Number(value);
        sqls.push(`${accessor} = :${valueFieldName}`);
        break;
      case '..':
        {
          const [min, max] = value.split('..').map(Number);
          if (Number.isNaN(min) || Number.isNaN(max)) {
            logger?.info(`Invalid range for ${column}: ${value}`);
            continue;
          }
          values[`${valueFieldName}_min`] = min;
          values[`${valueFieldName}_max`] = max;
          sqls.push(
            `${accessor} BETWEEN :${valueFieldName}_min AND :${valueFieldName}_max`,
          );
        }
        break;
      case '!=':
      case '<>':
        values[valueFieldName] = Number(value);
        sqls.push(`${accessor} != :${valueFieldName}`);
        joinOperator = 'AND';
        break;
      case '<=':
      case '<':
      case '>=':
      case '>':
        if (criterium.values.length > 1) {
          throw new Error('Number does not support multiple values');
        }
        values[valueFieldName] = Number(value);
        sqls.push(`${accessor} ${criterium.operator} :${valueFieldName}`);
        break;
      default:
        throw new Error(
          `Operator ${criterium.operator} is not supported for Number`,
        );
    }
  }
  if (sqls.length === 0) {
    return '';
  }
  return `(${sqls.join(` ${joinOperator} `)})`;
}
