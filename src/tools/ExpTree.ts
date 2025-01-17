export interface ExpNode {
  op: 'call' | 'if-else' | 'if-elseif-else' | 'getfield' | 'getTableField' | 'alias' | 'add' | 'sub' | 'mul' | 'div' | 'lt' | 'le' | 'eq' | 'gt' | 'ge' | 'immediate_num' | 'immediate_string' | 'immediate_bool' | 'immediate_null' | 'and' | 'or';
  targetName?: string;
  children?: ExpNode[];
  value?: string | number | boolean;
}
export interface SelectList {
  type: '*' | 'nodes';
  nodes?: ExpNode[];
}
