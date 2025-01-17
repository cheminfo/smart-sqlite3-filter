import type { Parameter, QueryCriterium } from '../types/QueryCriterium';

import type {
  Values,
  AppendSQLForCriteriaOptions,
} from './appendSQLForCriteria';

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
  const value = getBooleanValue(criterium.values[0]);
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
function getBooleanValue(value: string): boolean | null {
  value = value.toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') {
    return true;
  }
  if (value === 'false' || value === '0' || value === 'no') {
    return false;
  }
  return null;
}
