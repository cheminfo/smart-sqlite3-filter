export interface Parameter {
  column: string;
  type: string;
  accessor: string;
  jpath: string;
  isJpath: boolean;
}

export interface QueryCriterium {
  index: number;
  parameters: Parameter[];
  operator: string;
  values: string[];
  valuesType?: 'number' | 'string' | 'boolean';
  negate: boolean;
  sql?: string;
}
