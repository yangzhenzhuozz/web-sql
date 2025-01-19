import { DataSet, SQLSession } from '../main.js';
import { assert } from '../tools/assert.js';

let sql = `
select
  t1.id,max(score)
from
  t1 left join t2 as B on t1.id=B.id
group by t1.id
`;
let arr = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
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

console.log(`开始执行`);
console.time('Execution Time');
let ret = session.sql(sql);
console.table(ret.data);
console.timeEnd('Execution Time');
