import { assert, isWindowFrame } from './assert.js';
import { ExpNode, SelectClause, WindowFrame } from './ExpTree.js';
import { NeedGroupError } from './NeedGroupError.js';
import { SQLSession } from './SQLSession.js';

export interface FieldType {
  name: string;
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';
}
export type UDFHanler =
  | {
      type: 'normal';
      handler: (...args: any[]) => any | undefined;
    }
  | {
      type: 'aggregate';
      handler: (list: any[][], modifier?: 'distinct' | 'all') => any | undefined;
    }
  | {
      type: 'windowFrame';
      handler: (list: any[][], modifier?: 'distinct' | 'all') => any | undefined;
    };
export type UDF = {
  [key: string]: UDFHanler;
};

export class DataSet<T extends { [key: string | symbol]: any }> {
  public data: T[] = [];
  public name?: string;
  public session: SQLSession | undefined;

  /**
   * 通过表名.字段形式索引时，得到在数据集中的真实id，假设当前表名是t1，数据集里面的真实记录是[{id:1,name:john}],
   * 则通过 t1.name真实访问的是name
   */
  private tableNameToField: {
    [key: string]: {
      [key: string]: string;
    };
  } = {};

  public constructor(arr: T[], name?: string, session?: SQLSession) {
    this.name = name;
    this.data = arr;
    // this.fiels = new Set(Object.keys(arr[0]));
    if (name !== undefined) {
      this.tableNameToField = this.createTableNameToField(arr, name);
    }
    if (session !== undefined) {
      this.session = session;
    }
  }

  //用于创建t1.c1 => c1 t2.id=>t2.id 的映射(id在两个表中都有,c1只在t1中有,所以映射结果不同)
  private createTableNameToField(arr: any[], tableName: string, duplicateKey?: Set<string>) {
    let tableNameToField: {
      [key: string]: {
        [key: string]: string;
      };
    } = { [tableName]: {} };
    for (let k in arr[0]) {
      if (duplicateKey === undefined || !duplicateKey.has(k)) {
        tableNameToField[tableName][k] = k;
      } else {
        tableNameToField[tableName][k] = `${tableName}.${k}`;
      }
    }
    return tableNameToField;
  }
  //笛卡尔积
  private cross(f1: any[], f2: any, t1: string, t2: string, duplicateKey: Set<string>) {
    let ret = [];
    for (let r1 of f1) {
      for (let r2 of f2) {
        let tmpRow = {} as any;
        for (let k in r1) {
          if (duplicateKey.has(k)) {
            tmpRow[`${t1}.${k}`] = r1[k];
          } else {
            tmpRow[k] = r1[k];
          }
        }
        for (let k in r2) {
          if (duplicateKey.has(k)) {
            tmpRow[`${t2}.${k}`] = r2[k];
          } else {
            tmpRow[k] = r2[k];
          }
        }
        ret.push(tmpRow);
      }
    }
    return ret;
  }
  //深度遍历执行
  private execExp(exp: ExpNode, row: any): ExpNode {
    /**
     * 直接从缓存结果返回数据(比如用group by做了一次函数计算),
     * select
     *  left(name,4),//这里直接使用group by的计算结果
     *  left(name,4)+'a' //这里可以使用前一列的计算结果
     * from
     *  table
     * group by
     *  left(name,4) //会使用Symbol.for('left(name,4)')做key
     * order by
     *  left(name,4) //会使用Symbol.for('left(name,4)')做key
     */
    if (exp.op != 'immediate_val' && (row[exp.targetName] !== undefined || row[Symbol.for(exp.targetName)] !== undefined)) {
      return {
        op: 'immediate_val',
        targetName: exp.targetName,
        value: row[exp.targetName] !== undefined ? row[exp.targetName] : row[Symbol.for(exp.targetName)],
      };
    }

    let { op, children } = exp;
    let result: any | undefined = undefined;
    let l_Child: ExpNode;
    let r_Child: ExpNode;
    switch (op) {
      case 'immediate_val':
        result = exp.value;
        break;
      case 'alias':
        result = this.execExp(children![0], row).value;
        break;
      case 'getTableField':
        let [tableName, fieldName] = (<string>exp.value).split('.');
        if (this.tableNameToField[tableName] === undefined) {
          throw `无效表名:${tableName}`;
        }
        result = row[this.tableNameToField[tableName][fieldName]];
        exp.targetName = this.tableNameToField[tableName][fieldName]; //强制修改targetName,group和缓存都用得上了
        if (result === undefined) {
          throw `无效属性: ${tableName}.${fieldName},如果是在group之后select,请使用group key中的字段值`;
        }

        break;
      case 'getfield':
        let fieldName2 = exp.value as string;
        result = row[fieldName2];
        if (result === undefined) {
          throw `表: ${this.name} 没有字段: ${fieldName2}`;
        }
        break;
      case 'mod':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (typeof l_Child.value === 'number' && typeof r_Child.value === 'number') {
          result = l_Child.value! % r_Child.value!;
        } else {
          throw 'Unsupported type';
        }
        break;
      case 'add':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          if (typeof l_Child.value !== 'number' || typeof r_Child.value !== 'number') {
            result = l_Child.value!.toString() + r_Child.value!.toString();
          } else {
            result = l_Child.value! + r_Child.value!;
          }
        }
        break;
      case 'sub':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          if (typeof l_Child.value === 'number' && typeof r_Child.value === 'number') {
            result = l_Child.value! - r_Child.value!;
          } else {
            throw 'Unsupported type';
          }
        }
        break;
      case 'mul':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          if (typeof l_Child.value === 'number' && typeof r_Child.value === 'number') {
            result = l_Child.value! * r_Child.value!;
          } else {
            throw 'Unsupported type';
          }
        }
        break;
      case 'div':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          if (typeof l_Child.value === 'number' && typeof r_Child.value === 'number') {
            result = l_Child.value! / r_Child.value!;
          } else {
            throw 'Unsupported type';
          }
        }
        break;
      case 'gt':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! > r_Child.value!;
        }
        break;
      case 'ge':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! >= r_Child.value!;
        }
        break;
      case 'lt':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! < r_Child.value!;
        }
        break;
      case 'le':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! <= r_Child.value!;
        }
        break;
      case 'eq':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! == r_Child.value!;
        }
        break;
      case 'ne':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value != r_Child.value;
        }
        break;
      case 'and':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! && r_Child.value!;
        }
        break;
      case 'or':
        l_Child = this.execExp(children![0], row);
        r_Child = this.execExp(children![1], row);
        if (l_Child.value === null || r_Child.value === null) {
          result = null;
        } else {
          result = l_Child.value! || r_Child.value!;
        }
        break;
      case 'not':
        l_Child = this.execExp(children![0], row);

        if (l_Child.value === null) {
          result = null;
        } else {
          result = !l_Child.value!;
        }
        break;
      case 'is_null':
        l_Child = this.execExp(children![0], row);
        result = l_Child.value === null;
        break;
      case 'is_not_null':
        l_Child = this.execExp(children![0], row);
        result = l_Child.value !== null;
        break;
      case 'cast':
        l_Child = this.execExp(children![0], row);
        if (l_Child.value === null) {
          result = null;
        } else {
          assert(exp.cast_type != undefined);
          switch (exp.cast_type) {
            case 'string':
              result = String(l_Child.value);
              break;
            case 'boolean':
              result = Boolean(l_Child.value);
              break;
            case 'number':
              result = Number(l_Child.value);
              break;
            default:
              result = l_Child.value;
              break;
          }
        }
        break;
      case 'case':
        //如果没有else分支,最后一个是undefined
        for (let i = 0; i < children!.length - 1; i++) {
          let when = this.execExp(children![i].children![0], row).value;
          if (when === true) {
            result = this.execExp(children![i].children![1], row).value;
            break;
          }
        }
        if (result === undefined && children![children!.length - 1] !== undefined) {
          result = this.execExp(children![children!.length - 1].children![0], row).value;
        }
        if (result === undefined) {
          result = null;
        }
        break;
      case 'case-exp':
        let case_exp = this.execExp(children![0], row).value;
        //如果没有else分支,最后一个是undefined
        for (let i = 1; i < children!.length - 1; i++) {
          let when = this.execExp(children![i].children![0], row).value;
          if (when == case_exp) {
            result = this.execExp(children![i].children![1], row).value;
            break;
          }
        }
        if (result === undefined && children![children!.length - 1] !== undefined) {
          result = this.execExp(children![children!.length - 1].children![0], row).value;
        }
        if (result === undefined) {
          result = null;
        }
        break;
      case 'call':
        let fun_name = exp.value as string;
        if (this.session!.udf[fun_name] === undefined) {
          throw `未定义函数:${fun_name}`;
        }
        if (this.session!.udf[fun_name].type == 'aggregate') {
          //如果还没有开窗，则抛出一个特殊异常
          if (row[Symbol.for('@frameGroupValues')] === undefined) {
            throw new NeedGroupError();
          } else {
            let list = [] as any[][];
            for (let subLine of row[Symbol.for('@frameGroupValues')]) {
              let args = [];
              for (let child of children!) {
                let arg = this.execExp(child, subLine).value! as any;
                args.push(arg);
              }
              list.push(args);
            }
            result = this.session!.udf[fun_name].handler(list, exp.modifier);
          }
        } else if (this.session!.udf[fun_name].type == 'normal') {
          let args: any[] = [];
          for (let c of children!) {
            args.push(this.execExp(c, row).value as any);
          }
          result = this.session!.udf[fun_name].handler(...args);
        } else {
          if (row[Symbol.for('@frameGroupValues')] === undefined) {
            throw `还没有开窗,不能使用窗口函数${fun_name}`;
          } else {
            let list = [] as any[][];
            for (let subLine of row[Symbol.for('@frameGroupValues')]) {
              let args = [];
              for (let child of children!) {
                let arg = this.execExp(child, subLine).value! as any;
                args.push(arg);
              }
              list.push(args);
            }
            result = this.session!.udf[fun_name].handler(list);
          }
        }
        break;
      default:
        throw `Undefined opcode: ${op}`;
    }
    return {
      op: 'immediate_val',
      value: result,
      targetName: exp.targetName,
    };
  }
  //排序连接
  private sortMergeJoin(
    other: DataSet<any>,
    option: {
      k1: string;
      k2: string;
      t1: string;
      t2: string;
      duplicateKey: Set<string>;
    }
  ): any[] {
    let compare = (ka: string, kb: string) => {
      return (a: any, b: any) => {
        if (a[ka] < b[kb]) {
          return -1;
        } else if (a[ka] > b[kb]) {
          return 1;
        } else {
          return 0;
        }
      };
    };
    //搜索窗口区间
    let windowFrame = (arr: any[], start: number, k: string) => {
      if (start >= arr.length) {
        return 0;
      }
      let v = arr[start][k];
      let idx = start + 1;
      for (; idx < arr.length && arr[idx][k] == v; idx++) {}
      return idx - start;
    };

    let arr1 = Array.from(this.data);
    let arr2 = Array.from(other.data);

    arr1.sort(compare(option.k1, option.k1)); //a集合排序
    arr2.sort(compare(option.k2, option.k2)); //b集合排序

    //开始进行连接
    let idx1 = 0;
    let idx2 = 0;

    let ret = [] as any[];
    //arr2没有和arr1配得上的时候使用
    let empty2 = {} as any;
    for (let obj_k in arr2[0]) {
      empty2[obj_k] = null;
    }
    for (; idx1 < arr1.length; ) {
      let cmp: number;

      //arr2已经走完了
      if (idx2 < arr2.length) {
        cmp = compare(option.k1, option.k2)(arr1[idx1], arr2[idx2]);
      } else {
        cmp = 1;
      }

      let w1 = windowFrame(arr1, idx1, option.k1);
      let w2 = windowFrame(arr2, idx2, option.k2);
      let f1 = arr1.slice(idx1, idx1 + w1);
      if (cmp < 0 || w2 == 0) {
        ret.push(...this.cross(f1, [empty2], option.t1, option.t2, option.duplicateKey));
        idx1 += w1;
      } else if (cmp > 0) {
        idx2 += w2;
      } else {
        let f2 = arr2.slice(idx2, idx2 + w2);
        ret.push(...this.cross(f1, f2, option.t1, option.t2, option.duplicateKey));
        idx1 += w1;
        idx2 += w2;
      }
    }
    return ret;
  }
  public alias(name: string): DataSet<T> {
    return new DataSet(this.data, name, this.session);
  }

  public select(select_clause: SelectClause): DataSet<any> {
    let exps = select_clause.nodes;
    let arr = [] as any[];
    let windowFrames = [] as WindowFrame[];
    for (let row_idx = 0; row_idx < this.data.length; row_idx++) {
      let tmpRow = {} as any;
      //默认把原始列全部隐藏,除非被显式的select
      for (let k in this.data[row_idx]) {
        tmpRow[Symbol.for(k)] = this.data[row_idx][k];
      }
      for (let k of Object.getOwnPropertySymbols(this.data[row_idx])) {
        tmpRow[k] = this.data[row_idx][k];
      }
      for (let i = 0; i < exps.length; i++) {
        let exp = exps[i];
        if (isWindowFrame(exp)) {
          if (row_idx == 0) {
            windowFrames.push(exp);
          }
        } else {
          let cell = this.execExp(exp, tmpRow);
          if (tmpRow[cell.targetName!] !== undefined) {
            throw `select重复属性:${cell.targetName!}`;
          }
          tmpRow[cell.targetName!] = cell.value!;
        }
      }
      arr.push(tmpRow);
    }
    if (select_clause.modifier === 'all') {
      throw `不支持all`;
    } else if (select_clause.modifier === 'distinct') {
      let distinct_nodes = [] as ExpNode[];
      for (let k in arr[0]) {
        distinct_nodes.push({
          op: 'getfield',
          value: k,
          targetName: k,
        });
      }
      //这里的递归调用保证select不会再使用modifier，所以不会变成无线递归
      arr = new DataSet(arr, undefined, this.session).groupBy(distinct_nodes).select({ nodes: distinct_nodes }).data; //使用group by去重
    }

    console.log(`${select_clause.modifier}`);

    let ds = new DataSet(arr, undefined, this.session);
    ds.tableNameToField = this.tableNameToField; //select不更新tableNameToField
    ds.name = this.name;

    if (windowFrames.length > 0) {
      for (let windowFrame of windowFrames) {
        let tmpDs = ds.groupBy(windowFrame.partition); //各个不同分区的frame
        let frameResult = [] as any[];
        //对每一个窗口帧进行处理
        for (let line of tmpDs.data) {
          let frame = line[Symbol.for('@frameGroupValues')];

          if (windowFrame.order !== undefined) {
            let frameDS = new DataSet(frame, undefined, this.session);
            frameDS.tableNameToField = this.tableNameToField;
            frame = frameDS.orderBy(windowFrame.order).data;
          }

          if (ds.session!.udf[windowFrame.windowFunction.value! as string].type == 'aggregate') {
            let aggregateVal = ds.execExp(windowFrame.windowFunction, line).value;
            for (let row of frame) {
              row[windowFrame.alias ?? windowFrame.targetName] = aggregateVal;
            }
          } else if (ds.session!.udf[windowFrame.windowFunction.value! as string].type == 'windowFrame') {
            let windowFrameVals = ds.execExp(windowFrame.windowFunction, line).value as any[];
            for (let i = 0; i < windowFrameVals.length; i++) {
              frame[i][windowFrame.alias ?? windowFrame.targetName] = windowFrameVals[i];
            }
          }

          frameResult.push(...frame);
        }
        ds = new DataSet(frameResult, undefined, this.session);
        ds.tableNameToField = this.tableNameToField;
        ds.name = this.name;
      }
    }

    return ds;
  }
  public where(exp: ExpNode): DataSet<T> {
    let ret = [] as any[];
    for (let row of this.data) {
      let condition = this.execExp(exp, row);
      if (condition.value) {
        ret.push(row);
      }
    }
    let ds = new DataSet(ret, undefined, this.session);
    ds.tableNameToField = this.tableNameToField; //orderBy不更新tableNameToField
    ds.name = this.name;
    return ds;
  }
  public groupBy(exps: ExpNode[]): DataSet<any> {
    let ds = [] as any[];
    let groupKeys = new Set<string>(); //可能是t1.id或者是id
    for (let i = 0; i < this.data.length; i++) {
      let row = this.data[i];
      let tmpRow = { ...row } as any;
      let groupValues = [] as any[];
      for (let exp of exps) {
        let cell = this.execExp(exp, row);
        //如果表名或者字段名无效,在execExp这里就抛出异常了
        //只在第一行判断group key
        if (i == 0) {
          if (groupKeys.has(cell.targetName)) {
            throw `group重复属性:${cell.targetName}`;
          }
          groupKeys.add(cell.targetName);
        }

        tmpRow[Symbol.for(cell.targetName)] = cell.value!;
        groupValues.push(cell.value! as any);
      }
      tmpRow[Symbol.for('@groupKeys')] = groupValues.map((item) => item?.toString()).reduce((p, c) => p + ',' + c);
      ds.push(tmpRow);
    }
    let groupObj = Object.groupBy(ds, (item) => item[Symbol.for('@groupKeys')]);
    let groupDs = [] as any[];
    for (let gk in groupObj) {
      let tmpRow = {} as any;
      let group = groupObj[gk]!;
      for (let k of groupKeys) {
        tmpRow[Symbol.for(k)] = group[0][Symbol.for(k)];
      }
      tmpRow[Symbol.for('@frameGroupValues')] = group;
      groupDs.push(tmpRow);
    }

    let ret = new DataSet(groupDs, this.name, this.session);
    let tableNameToField = JSON.parse(JSON.stringify(this.tableNameToField));
    ret.tableNameToField = tableNameToField; //这里刷新之后可能取到不在group中的字段
    return ret;
  }
  public orderBy(exps: ExpNode[]) {
    let arr = [] as any[];
    let orderKeys = [] as { name: string; order: 'asc' | 'desc' }[];
    for (let i = 0; i < this.data.length; i++) {
      let row = this.data[i];
      let tmpRow = { ...row } as any;
      for (let exp of exps) {
        let ret = this.execExp(exp.children![0], row);
        if (exp.order !== 'asc') {
        } else {
        }
        let orderKey = '@order by ' + exp.targetName;
        tmpRow[Symbol.for(orderKey)] = ret.value;

        //只在第一行判断group key
        if (i == 0) {
          orderKeys.push({
            name: orderKey,
            order: exp.order!,
          });
        }
      }
      arr.push(tmpRow);
    }
    let compare = (a: any, b: any): number => {
      for (let k of orderKeys) {
        if (k.order == 'asc') {
          if (a[k.name] < b[k.name]) {
            return -1;
          } else if (a[k.name] > b[k.name]) {
            return 1;
          }
        } else {
          if (a[k.name] < b[k.name]) {
            return 1;
          } else if (a[k.name] > b[k.name]) {
            return -1;
          }
        }
      }
      return 0;
    };
    arr.sort(compare);
    let ds = new DataSet(arr, undefined, this.session);
    ds.tableNameToField = this.tableNameToField; //orderBy不更新tableNameToField
    ds.name = this.name;
    return ds;
  }
  public limit(exp: ExpNode): DataSet<any> {
    let n1 = exp.limit![0];
    let n2 = exp.limit![1];
    let arr = this.data;
    if (n2 === undefined) {
      arr = arr.slice(0, n1);
    } else {
      arr = arr.slice(n1 - 1, n2);
    }
    let ds = new DataSet(arr, undefined, this.session);
    ds.tableNameToField = this.tableNameToField; //limit不更新tableNameToField
    ds.name = this.name;
    return ds;
  }
  public leftJoin(other: DataSet<any>, exp: ExpNode): DataSet<any> {
    let retArr = [] as any[];

    assert(this.name !== undefined);
    assert(other.name !== undefined);

    //构造key
    let tableKey: {
      [key: string]: {
        table: string;
        id: string;
      };
    } = {}; //把a.c1映射到a.c1

    let keyTable: {
      [key: string]: {
        table: string;
        id: string;
      };
    } = {}; //把c1映射到a.c1
    //上面两个映射用于快速判断这个join是否可以进行优化

    let duplicateKey = new Set<string>(); //两个表重复的id

    for (let k in this.data[0]) {
      tableKey[`${this.name}.${k}`] = {
        table: this.name,
        id: k,
      };
      keyTable[k] = {
        table: this.name!,
        id: k,
      };
    }
    for (let k in other.data[0]) {
      tableKey[`${other.name}.${k}`] = {
        table: other.name,
        id: k,
      };
      if (keyTable[k] === undefined) {
        keyTable[k] = {
          table: other.name!,
          id: k,
        };
      } else {
        duplicateKey.add(k);
        // delete keyTable[k]; //两个表都有同样的字段，直接删除，不能再直接使用id取字段
      }
    }

    if (exp.op == 'eq') {
      let [exp1, exp2] = exp.children!;
      let f1 = exp1.op == 'getfield' ? keyTable[exp1.value as string] : tableKey[exp1.value as string];
      let f2 = exp2.op == 'getfield' ? keyTable[exp2.value as string] : tableKey[exp2.value as string];

      if (f1 !== undefined && f2 !== undefined && f1.table != f2.table) {
        //开始连接
        retArr = this.sortMergeJoin(other, {
          t1: this.name,
          t2: other.name,
          k1: f1.id,
          k2: f2.id,
          duplicateKey,
        });
        let ret = new DataSet(retArr, undefined, this.session);
        ret.tableNameToField = { ...this.createTableNameToField(this.data, this.name, duplicateKey), ...this.createTableNameToField(other.data, other.name, duplicateKey) };
        return ret;
      }
    }
    //只有左右表各直接选择一个字段进行等值连接才能优化
    console.warn(`只有从两个表各取一个字段等值连接有优化,其他情况使用笛卡尔积连接，请考虑优化`);
    retArr = this.cross(this.data, other.data, this.name, other.name, duplicateKey);
    let crossResult = new DataSet(retArr, undefined, this.session);
    crossResult.tableNameToField = { ...this.createTableNameToField(this.data, this.name, duplicateKey), ...this.createTableNameToField(other.data, other.name, duplicateKey) };
    crossResult = crossResult.where(exp);
    crossResult.name = `@crossResult`;
    return crossResult;
  }
}
