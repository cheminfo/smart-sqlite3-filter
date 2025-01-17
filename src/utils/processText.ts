import type { Parameter, QueryCriterium } from '../types/QueryCriterium';

import type { Values } from './appendSQLForCriteria';

export function processText(
  parameter: Parameter,
  criterium: QueryCriterium,
  values: Values,
) {
  const operator = criterium.operator || '^';
  const sqls = [];
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];
    const column = parameter.column;
    const accessor = parameter.accessor;

    const valueFieldName = `${column}_${criterium.index}_${valueIndex}`;
    switch (operator) {
      case '^':
        values[valueFieldName] = `${value}%`;
        sqls.push(`${accessor} LIKE :${valueFieldName}`);
        break;
      case '$':
        values[valueFieldName] = `%${value}`;
        sqls.push(`${accessor} LIKE :${valueFieldName}`);
        break;
      case '~':
        values[valueFieldName] = `%${value}%`;
        sqls.push(`${accessor} LIKE :${valueFieldName}`);
        break;
      case '=':
        values[valueFieldName] = value;
        sqls.push(`${accessor} = :${valueFieldName}`);
        break;
      default:
        throw new Error(
          `Operator ${criterium.operator} is not supported for String`,
        );
    }
  }
  return `(${sqls.join(' OR ')})`;
}
