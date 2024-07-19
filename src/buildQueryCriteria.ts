/**
 *
 * @param criteria
 * @param schema
 * @param options
 */
export function buildQueryCriteria(
  criteria,
  schema,
  options,
): Record<string, number | string> {
  const { defaultFields = Object.keys(schema), fieldsAliases = {} } = options;
  const values = {};
  // ensure we know where to search
  let index = 0;
  for (const criterium of criteria) {
    criterium.index = index++;
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

function buildSQL(criterium, schema, values) {
  const sql = [];
  for (const field of criterium.fields) {
    const column = schema[field];

    switch (column.type) {
      case 'TEXT':
        sql.push(processText(field, criterium, values));
        break;
      case 'REAL':
      case 'INTEGER':
        sql.push(processNumber(field, criterium, values));
        break;
      case 'BOOLEAN':
        sql.push(processBoolean(field, criterium, values));
        break;
      default:
        throw new Error(`Type ${column.type} is not supported`);
    }
  }
  return `(${sql.join(' OR ')})`;
}

function processText(field, criterium, values) {
  if (!criterium.operator) {
    criterium.operator = '^';
  }

  const sqls = [];
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];

    const valueFieldName = `${field}_${criterium.index}_${valueIndex}`;
    switch (criterium.operator) {
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

function processNumber(field, criterium, values) {
  if (!criterium.operator) {
    criterium.operator = '=';
  }
  const sqls = [];
  for (let valueIndex = 0; valueIndex < criterium.values.length; valueIndex++) {
    const value = criterium.values[valueIndex];

    const valueFieldName = `${field}_${criterium.index}_${valueIndex}`;

    switch (criterium.operator) {
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
  return `(${sqls.join(' OR ')})`;
}

function processBoolean(field, criterium, values) {
  if (values.length > 1) {
    throw new Error('Boolean does not support multiple values');
  }
  const value = criterium.values[0];
  if (!criterium.operator) {
    criterium.operator = '=';
  }
  switch (criterium.operator) {
    case '=':
      values[`${field}_${criterium.index}`] = value ? 1 : 0;
      return `${field} = :${field}_${criterium.index}`;
    default:
      throw new Error(
        `Operator ${criterium.operator} is not supported for Boolean`,
      );
  }
}
