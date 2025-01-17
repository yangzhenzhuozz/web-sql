import { assert } from './assert.js';
import { ExpNode } from './ExpTree.js';

export interface FieldType {
  name: string;
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';
}
export class DataSet<T extends { [key: string]: any }> {
  private schemaIdx: { [key: string]: string } = {};
  public data: T[] = [];
  public name?: string;
  public udf: { [key: string]: (...args: any[]) => ExpNode } = {
    concat: (...args: any[]) => {
      return {
        op: 'immediate_string',
        value: `调用了函数concat,参数为${args}`,
      };
    },
  };
  public constructor(arr: T[], name?: string) {
    this.name = name;
    for (let k in arr[0]) {
      let fieldName = `${name ?? ''}.${k}`;
      this.schemaIdx[fieldName] = k;
    }
    this.data = arr;
  }
  public alias(name: string): DataSet<T> {
    return new DataSet(this.data, name);
  }

  //深度遍历执行
  private execExp(exp: ExpNode, row: T): ExpNode {
    let { op, children, targetName } = exp;
    switch (op) {
      case 'immediate_num':
      case 'immediate_string':
      case 'immediate_null':
      case 'immediate_bool':
        return {
          op: op,
          value: exp.value!,
          targetName: String(exp.value!),
        };
      case 'alias':
        return {
          op: 'alias',
          value: this.execExp(children![0], row).value,
          targetName: targetName,
        };
      case 'getTableField':
        let fieldName = exp.value as string;
        let idx = this.schemaIdx[fieldName];
        if (idx == undefined) {
          throw `Invalid field name: ${fieldName}`;
        }
        return {
          op: op,
          targetName: (<string>exp.value).split('.')[1],
          value: row[idx],
        };
      case 'getfield':
        let fieldName2 = exp.value as string;
        if (row[fieldName2] == undefined) {
          throw `Table: ${this.name} does not have field: ${fieldName2}`;
        }
        return {
          op: op,
          targetName: <string>exp.value,
          value: row[fieldName2],
        };
      case 'add':
        let lcAdd = this.execExp(children![0], row);
        let rcAdd = this.execExp(children![1], row);
        let valAdd: string | number;
        if (typeof lcAdd.value !== 'number' || typeof rcAdd.value !== 'number') {
          valAdd = lcAdd.value!.toString() + rcAdd.value!.toString();
        } else {
          valAdd = lcAdd.value! + rcAdd.value!;
        }
        return {
          op: typeof valAdd == 'string' ? 'immediate_string' : 'immediate_num',
          value: valAdd,
          targetName: String(valAdd),
        };
      case 'sub':
        let lcSub = this.execExp(children![0], row);
        let rcSub = this.execExp(children![1], row);
        let valSub: string | number;
        if (typeof lcSub.value === 'number' && typeof rcSub.value === 'number') {
          valSub = lcSub.value! - rcSub.value!;
        } else {
          throw 'Unsupported type';
        }
        return {
          op: 'immediate_num',
          value: valSub,
          targetName: String(valSub),
        };
      case 'mul':
        let lcMul = this.execExp(children![0], row);
        let rcMul = this.execExp(children![1], row);
        let valMul: string | number;
        if (typeof lcMul.value === 'number' && typeof rcMul.value === 'number') {
          valMul = lcMul.value! * rcMul.value!;
        } else {
          throw 'Unsupported type';
        }
        return {
          op: 'immediate_num',
          value: valMul,
          targetName: String(valMul),
        };
      case 'div':
        let lcDiv = this.execExp(children![0], row);
        let rcDiv = this.execExp(children![1], row);
        let valDiv: string | number;
        if (typeof lcDiv.value === 'number' && typeof rcDiv.value === 'number') {
          valDiv = lcDiv.value! / rcDiv.value!;
        } else {
          throw 'Unsupported type';
        }
        return {
          op: 'immediate_num',
          value: valDiv,
          targetName: String(valDiv),
        };
      case 'gt':
        let lcgt = this.execExp(children![0], row);
        let rcgt = this.execExp(children![1], row);
        let valgt = lcgt.value! > rcgt.value!;
        return {
          op: 'immediate_bool',
          value: valgt,
          targetName: String(valgt),
        };
      case 'ge':
        let lcge = this.execExp(children![0], row);
        let rcge = this.execExp(children![1], row);
        let valge = lcge.value! >= rcge.value!;
        return {
          op: 'immediate_bool',
          value: valge,
          targetName: String(valge),
        };
      case 'lt':
        let lclt = this.execExp(children![0], row);
        let rclt = this.execExp(children![1], row);
        let vallt = lclt.value! < rclt.value!;
        return {
          op: 'immediate_bool',
          value: vallt,
          targetName: String(vallt),
        };
      case 'le':
        let lcle = this.execExp(children![0], row);
        let rcle = this.execExp(children![1], row);
        let valle = lcle.value! <= rcle.value!;
        return {
          op: 'immediate_bool',
          value: valle,
          targetName: String(valle),
        };
      case 'eq':
        let lceq = this.execExp(children![0], row);
        let rceq = this.execExp(children![1], row);
        let valeq = lceq.value! == rceq.value!;
        return {
          op: 'immediate_bool',
          value: valeq,
          targetName: String(valeq),
        };
      case 'and':
        let lcand = this.execExp(children![0], row);
        let rcand = this.execExp(children![1], row);
        let valand = lcand.value! && rcand.value!;
        return {
          op: 'immediate_bool',
          value: valand,
          targetName: String(valand),
        };
      case 'or':
        let lcor = this.execExp(children![0], row);
        let rcor = this.execExp(children![1], row);
        let valor = lcor.value! || rcor.value!;
        return {
          op: 'immediate_bool',
          value: valor,
          targetName: String(valor),
        };
      case 'if-else':
        let if_else_condition = this.execExp(children![0], row);
        let if_else_targetName = `if ${if_else_condition.targetName}`;
        if (if_else_condition.value!) {
          let ret = this.execExp(children![1], row);
          if_else_targetName += ret.targetName;
          ret.targetName = if_else_targetName;
          return ret;
        } else {
          let ret = this.execExp(children![2], row);
          if_else_targetName += ret.targetName;
          ret.targetName = if_else_targetName;
          return ret;
        }
      case 'if-elseif-else':
        let if_else_if_ret: ExpNode | undefined = undefined;
        let if_else_if_targetName = 'if ';
        for (let i = 0; i < children!.length - 2; i += 2) {
          let condition = this.execExp(children![i], row);
          if_else_if_targetName += ' ' + condition.targetName;
          if (condition.value!) {
            if_else_if_ret = this.execExp(children![i + 1], row);
            if_else_if_targetName += ' ' + if_else_if_ret.targetName;
            break;
          }
        }
        if (if_else_if_ret == undefined) {
          if_else_if_ret = this.execExp(children![children!.length - 1], row);
          if_else_if_targetName += ' ' + if_else_if_ret.targetName;
        }
        if_else_if_ret.targetName = if_else_if_targetName;
        return if_else_if_ret;
      case 'call':
        let fun_name = exp.value as string;
        let call_targetName = fun_name + '(';
        if (this.udf[fun_name] == undefined) {
          throw `未定义函数:${fun_name}`;
        }
        let args = [];
        let first_arg = true;
        for (let c of children!) {
          let a = this.execExp(c, row);
          args.push(a.value);
          if (!first_arg) {
            call_targetName += ',' + a.targetName;
          } else {
            call_targetName += a.targetName;
          }
          first_arg = false;
        }
        call_targetName += ')';
        let call_ret = this.udf[fun_name](args);
        call_ret.targetName = call_targetName;
        return call_ret;
      default:
        throw `Undefined opcode: ${op}`;
    }
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
    return new DataSet(ret, this.name);
  }
  public where(exp: ExpNode) {
    let ret = [] as any[];
    for (let row of this.data) {
      let condition = this.execExp(exp, row);
      if (condition.value) {
        ret.push(row);
      }
    }
    return new DataSet(ret, this.name);
  }
}
