export interface TableInfo {
  cid: number;
  name: 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'BOOLEAN';
  type: string;
  notnull: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  dflt_value: any;
  pk: number;
}
