import type { Parameter, QueryCriterium } from '../types/QueryCriterium.ts';

import type {
  AppendSQLForCriteriaOptions,
  Values,
} from './appendSQLForCriteria.ts';
import { processBoolean } from './processBoolean.ts';
import { processNumber } from './processNumber.ts';
import { processText } from './processText.ts';

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
      return undefined;
  }
}
