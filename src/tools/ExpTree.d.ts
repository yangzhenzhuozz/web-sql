export type valueType = string | number | boolean | null;
export type valueTypeList = valueType[];
export interface ExpNode {
  op: 'limit' | '*' | 'group' | 'order' | 'group_having' | 'call' | 'if-else' | 'if-elseif-else' | 'getfield' | 'getTableField' | 'alias' | 'mod' | 'add' | 'sub' | 'mul' | 'div' | 'lt' | 'le' | 'eq' | 'gt' | 'ge' | 'immediate_val' | 'and' | 'or' | 'not';
  targetName: string;
  children?: ExpNode[];
  value?: valueType|valueTypeList;
  order?: 'asc' | 'desc';
  limit?: number[];
}
export interface SelectList {
  nodes: (ExpNode | WindowFrame)[];
}
export interface WindowFrame {
  windowFunction: ExpNode;
  partition: ExpNode[];
  order?: ExpNode[];
  alias?: string;
  targetName: string;
}
