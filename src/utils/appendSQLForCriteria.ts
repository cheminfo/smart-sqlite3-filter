import { QueryCriterium } from '../types/QueryCriterium';
import { Schema } from '../types/Schema';

type Values = Record<string, number | string>;

interface AppendSQLForCriteriaOptions {
  defaultFields?: string[];
  fieldsAliases?: Record<string, string[]>;
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
  const { defaultFields = Object.keys(schema), fieldsAliases = {} } = options;
  const values: Values = {};
  // ensure we know where to search
  for (const criterium of criteria) {
    if (criterium.fields.length === 1) {
      if (fieldsAliases[criterium.fields[0]]) {
        criterium.fields = fieldsAliases[criterium.fields[0]];
      }
    } else if (criterium.fields.length === 0) {
      criterium.fields = defaultFields;
    }
  }

  // check if all the fields exists in the schema
  for (const criterium of criteria) {
    for (const field of criterium.fields) {
      if (!schema[field]) {
        throw new Error(`Field ${field} does not exist in the schema`);
      }
    }
  }
  // build the corresponding sql part
  for (const criterium of criteria) {
    criterium.sql = buildSQL(criterium, schema, values);
  }
  return values;
}

function buildSQL(criterium: QueryCriterium, schema: Schema, values: Values) {
  const sql = [];
  for (const field of criterium.fields) {
    const column = schema[field];

    switch (column.type) {
      case 'TEXT':
        {
          const newSQL = processText(field, criterium, values);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'REAL':
      case 'INT':
      case 'INTEGER':
        {
          const newSQL = processNumber(field, criterium, values);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'BOOLEAN':
        {
          const newSQL = processBoolean(field, criterium, values);
          if (newSQL) {
            sql.push(newSQL);
          }
        }
        break;
      case 'BLOB':
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

function processText(field: string, criterium: QueryCriterium, values: Values) {
  const operator = criterium.operator || '^';
  const sqls = [];
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];

    const valueFieldName = `${field}_${criterium.index}_${valueIndex}`;
    switch (operator) {
      case '^':
        values[valueFieldName] = `${value}%`;
        sqls.push(`${field} LIKE :${valueFieldName}`);
        break;
      case '$':
        values[valueFieldName] = `%${value}`;
        sqls.push(`${field} LIKE :${valueFieldName}`);
        break;
      case '~':
        values[valueFieldName] = `%${value}%`;
        sqls.push(`${field} LIKE :${valueFieldName}`);
        break;
      case '=':
        values[valueFieldName] = value;
        sqls.push(`${field} = :${valueFieldName}`);
        break;
      default:
        throw new Error(
          `Operator ${criterium.operator} is not supported for String`,
        );
    }
  }
  return `(${sqls.join(' OR ')})`;
}

function processNumber(
  field: string,
  criterium: QueryCriterium,
  values: Values,
) {
  const operator = criterium.operator || '=';
  const sqls = [];
  let joinOperator = 'OR';
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];
    // is it really a number ? We should skip otherwise
    if (operator !== '..' && Number.isNaN(Number(value))) {
      continue;
    }
    const valueFieldName = `${field}_${criterium.index}_${valueIndex}`;

    switch (operator) {
      case '=':
        values[valueFieldName] = Number(value);
        sqls.push(`${field} = :${valueFieldName}`);
        break;
      case '..':
        {
          const [min, max] = value.split('..').map(Number);
          values[`${valueFieldName}_min`] = min;
          values[`${valueFieldName}_max`] = max;
          sqls.push(
            `${field} BETWEEN :${valueFieldName}_min AND :${valueFieldName}_max`,
          );
        }
        break;
      case '!=':
      case '<>':
        values[valueFieldName] = Number(value);
        sqls.push(`${field} != :${valueFieldName}`);
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
        sqls.push(`${field} ${criterium.operator} :${valueFieldName}`);
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

function processBoolean(
  field: string,
  criterium: QueryCriterium,
  values: Values,
) {
  if (criterium.values.length > 1) {
    throw new Error('Boolean does not support multiple values');
  }
  const value = getBooleanValue(criterium.values[0]);
  if (value === null) {
    return '';
  }
  const operator = criterium.operator || '=';
  switch (operator) {
    case '=':
      values[`${field}_${criterium.index}`] = value ? 1 : 0;
      return `${field} = :${field}_${criterium.index}`;
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
