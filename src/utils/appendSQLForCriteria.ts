import type { Logger } from 'cheminfo-types';

import type { QueryCriterium } from '../types/QueryCriterium';
import type { Schema } from '../types/Schema';

import { processBlob } from './processBlob';
import { processBoolean } from './processBoolean';
import { processNumber } from './processNumber';
import { processText } from './processText';

export type Values = Record<string, number | string>;

export interface AppendSQLForCriteriaOptions {
  defaultFields?: string[];
  fieldsAliases?: Record<string, string[]>;
  logger?: Logger;
}

/**
 *
 * @param criteria
 * @param schema
 * @param options
 */
export function appendSQLForCriteria(
  criteria: QueryCriterium[],
  schema: Schema,
  options: AppendSQLForCriteriaOptions = {},
): Record<string, number | string> {
  const values: Values = {};
  // build the corresponding sql part
  for (const criterium of criteria) {
    criterium.sql = buildSQL(criterium, values, options);
  }
  return values;
}

function buildSQL(
  criterium: QueryCriterium,
  values: Values,
  options: AppendSQLForCriteriaOptions,
) {
  const sql = [];
  for (const parameter of criterium.parameters) {
    switch (parameter.type) {
      case 'TEXT':
        {
          const newSQL = processText(parameter, criterium, values);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'REAL':
      case 'INT':
      case 'INTEGER':
        {
          const newSQL = processNumber(parameter, criterium, values, options);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'BOOLEAN':
        {
          const newSQL = processBoolean(parameter, criterium, values, options);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'BLOB':
        {
          const newSQL = processBlob(parameter, criterium, values, options);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'NULL':
        break;
      default:
        throw new Error(
          `Type ${column.type} is not supported. Consider using STRICT mode to avoid issues. The following types are supported: TEXT, REAL, INTEGER, BOOLEAN`,
        );
    }
  }
  if (sql.length === 0) {
    return '';
  }
  return `(${sql.join(' OR ')})`;
}
