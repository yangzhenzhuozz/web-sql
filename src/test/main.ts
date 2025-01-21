import { DataSet } from '../tools/DataSet.js';
import { SQLSession } from '../tools/SQLSession.js';

//测试多个窗口分区函数,每个分区里面有多个分区字段
let sql = `
select
  *, row_number() over(partition by id1 % 2,id2 order by id desc) as xxx
from
  test
order by id
`;
let arrWin = [
  { id: 1, id1: 1, id2: 1 },
  { id: 2, id1: 1, id2: 1 },
  { id: 3, id1: 3, id2: 3 },
  { id: 4, id1: 4, id2: 2 },
  { id: 5, id1: 1, id2: 1 },
];
let dsWin = new DataSet(arrWin, 'test');
let arr = [
  { id: 1, name: '张三', tag: 1 },
  { id: 1, name: '张三', tag: 2 },
  { id: 2, name: '李四', tag: 3 },
];
let arr2 = [
  { id: 2, score: 5 },
  { id: 2, score: 8 },
  { id: 3, score: 10 },
];

//创建两个数据集
let ds = new DataSet(arr, 't1');
let ds2 = new DataSet(arr2, 't2');

//把集合注册到Session中
let session = new SQLSession();
session.reisgerUDF('max', {
  type: 'aggregate',
  handler: function (list: number[]) {
    let ret = list[0];
    for (let v of list) {
      if (v == undefined) {
        return null;
      }
      ret = Math.max(ret, v);
    }
    return ret;
  },
});
session.registTableView(ds);
session.registTableView(ds2);
session.registTableView(dsWin);

console.log(`开始执行`);
console.time('Execution Time');
let ret = session.sql(sql);
console.table(ret.data);
console.timeEnd('Execution Time');
