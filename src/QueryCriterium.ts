export interface QueryCriterium {
  index: number;
  fields: string[];
  operator: string;
  values: string[];
  negate: boolean;
  sql?: string;
}
