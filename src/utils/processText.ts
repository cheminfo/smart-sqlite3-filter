import type { Parameter, QueryCriterium } from '../types/QueryCriterium.ts';

import type { Values } from './appendSQLForCriteria.ts';

export function processText(
  parameter: Parameter,
  criterium: QueryCriterium,
  values: Values,
) {
  const operator = criterium.operator || '^';
  const sqls = [];
  for (const [valueIndex, value] of criterium.values.entries()) {
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
