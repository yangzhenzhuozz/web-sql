import { DataSet } from './tools/DataSet.js';
import { SQLSession } from './tools/SQLTools.js';

let code = `
select
    1 as _c,
    t1.id as c0,
    id as c1,
    t1.id,
    name as c2
from
    aaa as t1
`;

let arr: { id: number; name: string }[] = [
  { id: 1, name: 'john' },
  { id: 2, name: 'kelly' },
];
for (let i = 0; i < 20; i++) {
  arr.push({ id: i, name: 'id_' + i });
}
let ds = DataSet.create(arr, { name: 'aaa' });

SQLSession.registTableView(ds);
console.time('Execution Time');
let ret = SQLSession.sql(code);
console.table(ret);
console.timeEnd('Execution Time');
