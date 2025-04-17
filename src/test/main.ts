import { DataSet } from '../tools/DataSet.js';
import { SQLSession } from '../tools/SQLSession.js';

//测试多个窗口分区函数,每个分区里面有多个分区字段
let sql = `
select
id2,
test.id2 is not null
from
  test
where id2 <> 2
`;
let arr = [];
let size = 5;
for (let i = 1; i <= size; i++) {
  arr.push({ id1: i, id2: i < 2 ? null : i });
}
let session = new SQLSession();
session.registTableView(new DataSet(arr, 'test'));

console.log(`开始执行`);
console.time('Execution Time');
let ret = session.sql(sql);
console.table(ret.data.slice(0, 10));
console.timeEnd('Execution Time');
