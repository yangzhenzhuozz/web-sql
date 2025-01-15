import { assert } from './assert.js';
import { ExpNode } from './ExpTree.js';

export interface FieldType {
  name: string;
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';
}
export class DataSet<T extends { [key: string]: any }> {
  public schema: FieldType[] = [];
  private schemaIdx: { [key: string]: string } = {};
  public data: T[] = [];
  public name?: string;
  public static create<_T extends { [key: string]: any }>(
    arr: _T[],
    option: {
      schema?: FieldType[];
      name?: string;
    }
  ): DataSet<_T> {
    let ret = new DataSet<_T>();
    if (option.schema == undefined) {
      assert(option.name != undefined);
      ret.name = option.name;
      ret.schema = [];
      for (let k in arr[0]) {
        let fieldName = `${option.name}.${k}`;
        ret.schemaIdx[fieldName] = k;
        ret.schema.push({
          name: fieldName,
          type: typeof arr[0][k],
        });
      }
    } else {
      ret.schema = option.schema;
    }
    ret.data = arr;
    return ret;
  }
  public alias(name: string): DataSet<T> {
    return DataSet.create(this.data, { name: name });
  }

  //深度遍历执行
  private execExp(exp: ExpNode, row: T): ExpNode {
    let { op, children, targetName } = exp;
    if (op == 'immediate_num' || op == 'immediate_string') {
      return {
        op: op,
        value: exp.value!,
        targetName: String(exp.value!),
      };
    } else if (op == 'alias') {
      return {
        op: 'alias',
        value: this.execExp(children![0], row).value,
        targetName: targetName,
      };
    } else if (op == 'add') {
      let lc = this.execExp(children![0], row);
      let rc = this.execExp(children![1], row);
      let val: string | number;
      if (typeof lc.value === 'string' || typeof rc.value === 'string') {
        val = lc.value!.toString() + rc.value!.toString();
      } else {
        val = lc.value! + rc.value!;
      }
      return {
        op: typeof val == 'string' ? 'immediate_string' : 'immediate_num',
        value: val,
        targetName: String(val),
      };
    } else if (op == 'getTableField') {
      let fieldName = exp.value as string;
      let idx = this.schemaIdx[fieldName];
      if (idx == undefined) {
        throw `无效属性名:${fieldName}`;
      }
      return {
        op: op,
        targetName: (<string>exp.value).split('.')[1],
        value: row[idx],
      };
    } else if (op == 'getfield') {
      let fieldName = exp.value as string;
      if (row[fieldName] == undefined) {
        throw `表:${this.name}没有属性:${fieldName}`;
      }
      return {
        op: op,
        targetName: <string>exp.value,
        value: row[fieldName],
      };
    }
    throw `没有被定义的操作码:${op}`;
  }
  public select(exps: ExpNode[]): DataSet<any> {
    let ret = [] as any[];
    for (let row of this.data) {
      let tmpRow = {} as any;
      for (let i = 0; i < exps.length; i++) {
        let exp = exps[i];
        let cell = this.execExp(exp, row);
        if (tmpRow[cell.targetName!] != undefined) {
          throw `重复属性:${cell.targetName!}`;
        }
        tmpRow[cell.targetName!] = cell.value!;
      }
      ret.push(tmpRow);
    }
    return DataSet.create(ret, { name: '@result' });
  }
}
