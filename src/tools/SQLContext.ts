import { assert } from './assert.js';
import { DataSet } from './DataSet.js';
export class SQLContext {
  private _tableView: {
    [key: string]: DataSet<any>;
  } = {};
  get tableView(): {
    [key: string]: DataSet<any>;
  } {
    return this._tableView;
  }
  public static genSelectView(t_v: { [key: string]: DataSet<any> }) {
    let ret: {
      [key: string]: DataSet<any>;
    } = {};
    for (let k in t_v) {
      ret[k] = t_v[k];
    }
    return ret;
  }
  public static registTableView(dataset: DataSet<any>) {
    let tableName = dataset.name;
    assert(tableName != undefined);
    if (sqlSession._tableView[tableName] != undefined) {
      throw `表:${name}已经存在`;
    } else {
      sqlSession._tableView[tableName] = dataset;
    }
  }
}

export let sqlSession: SQLContext = new SQLContext();
