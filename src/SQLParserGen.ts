import { Grammar, default as TSCC } from 'tscc';
import fs from 'fs';
function gen() {
  let grammar: Grammar = {
    userCode:`//这个文件用SQLParserGen.ts生成的`,
    tokens: ['from', 'id', 'select', 'where', ',', 'as', '+', '-', '*', '/', '(', ')', 'if', 'then', 'else', 'elseif', 'end', 'and', 'or', 'order', 'group', 'by', 'asc', 'desc', 'having', 'limit', 'number', 'string'],
    association: [
      { left: ['or'] },
      { left: ['and'] },
      { left: ['+', '-'] },
      { left: ['*', '/'] },
      { nonassoc: ['low_as'] }, //比as优先级低一些
      { nonassoc: ['as'] },
    ],
    //这里终于要大量使用"中间动作"这种技术了
    BNF: [
      { 'program:query': {} },
      { 'query:from table_view where_clause group_clause select_clause order_clause limit_clause': {} },
      { 'table_view:id': {} },
      { 'table_view:( query ) as  id': {} },
      { 'where_clause:': {} },
      { 'where_clause:where where_condition': {} },
      { 'where_condition:exp': {} },
      { 'group_clause:': {} },
      { 'group_clause:group by group_list having_clause': {} },
      { 'group_list:group_item , group_list': {} },
      { 'group_list:group_item': {} },
      { 'group_item:exp': {} }, //这里可能会导致性能问题，如:from t group by f1(t.v1) select f1(t.v1)，甚至是非常复杂的表达式计算，实在没时间做优化了
      { 'having_clause:': {} },
      { 'having_clause:having exp': {} },
      { 'select_clause:ε': {} },
      { 'select_clause:select select_list': {} },
      { 'select_clause:select *': {} },
      { 'select_list:select_list , select_item': {} },
      { 'order_clause:': {} },
      { 'order_clause:order by order_by_list': {} },
      { 'order_by_list:order_by_item , order_by_list': {} },
      { 'order_by_list:order_by_item order_key': {} },
      { 'order_key:': {} },
      { 'order_key:asc': {} },
      { 'order_key:desc': {} },
      { 'order_by_item:id': {} },
      { 'limit_clause:': {} },
      { 'limit_clause:limit number': {} },
      { 'limit_clause:limit number , number': {} },
      { 'select_list:select_item': {} },
      { 'select_item:exp': {} },
      { 'select_item:alias_exp': {} },
      { 'alias_exp:exp as id': {} },
      { 'exp:number': {} },
      { 'exp:string': {} },
      { 'exp:id': {} },
      { 'exp:exp + exp': {} },
      { 'exp:exp - exp': {} },
      { 'exp:exp * exp': {} },
      { 'exp:exp / exp': {} },
      { 'exp:exp and exp': {} },
      { 'exp:exp or exp': {} },
      { 'exp:( exp )': {} },
      { 'exp:id ( argu_list )': {} },
      { 'argu_list:ε': {} },
      { 'argu_list:argu_item , argu_list': {} },
      { 'argu_list:argu_item': {} },
      { 'argu_item:exp': {} },
      { 'exp:if exp then exp elseif_list else exp end': {} },
      { 'elseif_list:elseif_list elseif_item': {} },
      { 'elseif_list:elseif_item': {} },
      { 'elseif_item:elseif exp then exp': {} },
    ],
  };
  let tscc = new TSCC(grammar, { debug: false, language: 'zh-cn' });
  let compilerSorce = tscc.generate();
  fs.writeFileSync('./src/SQLParser.ts', compilerSorce!);
  console.log('geneate end');
}
gen();
