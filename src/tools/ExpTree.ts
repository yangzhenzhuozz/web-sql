export interface ExpNode {
  op: 'getfield' | 'getTableField' | 'alias' | 'add' | 'sub' | 'mul' | 'div' | 'if' | 'immediate_num' | 'immediate_string';
  targetName?: string;
  children?: ExpNode[];
  value?: string | number;
}
export interface SelectList {
  type: '*' | 'nodes';
  nodes?: ExpNode[];
}
