import type { Parameter, QueryCriterium } from '../types/QueryCriterium.ts';

import type {
  AppendSQLForCriteriaOptions,
  Values,
} from './appendSQLForCriteria.ts';

export function processBoolean(
  parameter: Parameter,
  criterium: QueryCriterium,
  values: Values,
  options: AppendSQLForCriteriaOptions,
) {
  const { logger } = options;
  const column = parameter.column;
  const accessor = parameter.accessor;
  if (criterium.values.length > 1) {
    if (logger) logger.info('Boolean does not support multiple values');
    return '';
  }
  const [firstValue = ''] = criterium.values;
  const value = getBooleanValue(firstValue);
  if (value === null) {
    return '';
  }
  const operator = criterium.operator || '=';
  switch (operator) {
    case '=':
      values[`${column}_${criterium.index}`] = value ? 1 : 0;
      return `${accessor} = :${column}_${criterium.index}`;
    default:
      throw new Error(
        `Operator ${criterium.operator} is not supported for Boolean`,
      );
  }
}
const TRUE_VALUES = new Set(['true', '1', 'yes']);
const FALSE_VALUES = new Set(['false', '0', 'no']);

function getBooleanValue(value: string): boolean | null {
  const lowerCaseValue = value.toLowerCase();
  if (TRUE_VALUES.has(lowerCaseValue)) {
    return true;
  }
  if (FALSE_VALUES.has(lowerCaseValue)) {
    return false;
  }
  return null;
}
