import { DataSet } from './DataSet.js';
import { Lexical } from './Lexical.js';
import { SQLContext } from './SQLContext.js';
import Parse from './SQLParser.js';
export const SQLSession = {
  sql: function (src: string) {
    return Parse(new Lexical(src)).data;
  },
  registTableView: function (dataset: DataSet<any>) {
    SQLContext.registTableView(dataset);
  },
};
