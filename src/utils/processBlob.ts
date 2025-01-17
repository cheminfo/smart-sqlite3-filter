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
  switch (criterium.valuesType) {
    case 'string':
      return processText(parameter, criterium, values);
    case 'number':
      return processNumber(parameter, criterium, values, options);
    case 'boolean':
      return processBoolean(parameter, criterium, values, options);
    default:
      logger?.info(`Invalid values for BLOB: ${criterium.values.toString()}`);
  }
}
