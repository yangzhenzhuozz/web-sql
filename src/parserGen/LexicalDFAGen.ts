import { genDFA } from 'tslex';
import { LexerRule } from 'tslex/dist/automaton.js';
import { YYTOKEN } from '../tools/SQLParserDeclare.d.js';
import fs from 'fs';
let rules: LexerRule<YYTOKEN>[] = [
  {reg: '[ \t\n\r]+',handler: function (text) {return {yytext: text,type: 'space',value: text,};},}, //prettier-ignore

  {reg: 'partition',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'over',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore

  {reg: 'case',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'when',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'from',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'select',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'where',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'left',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'join',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'on',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: ',',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'as',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '<',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '<=',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '=',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '<>',handler: function (text) {return {yytext: text,type: '!=',value: text,};},}, // prettier-ignore
  {reg: '!=',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '>',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '>=',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '%',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\*',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\.',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\+',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\-',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\*',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '/',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\(',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: '\\)',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'if',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'then',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'else',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'elseif',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'end',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'and',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'or',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'not',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'order',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'group',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'by',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'asc',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'desc',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'having',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'limit',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'is',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'null',handler: function (text) {return {yytext: text,type: text,value: null,};},}, // prettier-ignore
  {reg: 'cast',handler: function (text) {return {yytext: text,type: text,value: text,};},}, // prettier-ignore
  {reg: 'string',handler: function (text) {return {yytext: text,type: 'type',value: text,};},}, // prettier-ignore
  {reg: 'number',handler: function (text) {return {yytext: text,type: 'type',value: text,};},}, // prettier-ignore
  {reg: 'boolean',handler: function (text) {return {yytext: text,type: 'type',value: text,};},}, // prettier-ignore
  // prettier-ignore
  {reg: '[_a-zA-Z][a-zA-Z0-9_]*',handler: function (text) {return {yytext: text,type: 'id',value: text,};},}, //id的优先级最低,避免把关键字识别成id
  {
    reg: '[0-9]+\\.[0-9]+',
    handler: function (text) {
      return { yytext: text, type: 'number', value: Number(text) };
    },
  },
  {
    reg: '[0-9]+',
    handler: function (text) {
      return { yytext: text, type: 'number', value: Number(text) };
    },
  },
  {
    reg: `'([^']|(\\\\'))*'`,
    handler: function (text) {
      text = text.replaceAll('\\n', '\n').replaceAll('\\\\', '\\').replaceAll('\\t', '\t').replaceAll('\\r', '\r').replaceAll("\\'", "'").replaceAll('\\"', '"');
      return { yytext: text, type: 'string', value: text.slice(1, -1) };
    },
  },
];
let dfa = genDFA(rules);

//用于在序列化的时候给函数参数加上string签名，这里是replace替换的，可能会有bug
let functionStrCache: { [key: string]: string } = {};
let serializedDfa = JSON.stringify(dfa.serialize(), (key, value) => {
  if (typeof value === 'function') {
    let signature = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    let functionStr = value.toString().replace(/^(function)?\s*\(([^\)]*)\)/, '$1 ($2:string)');
    functionStrCache[signature] = functionStr;
    return signature;
  } else {
    return value;
  }
});

for (let k in functionStrCache) {
  serializedDfa = serializedDfa.replaceAll(`"${k}"`, functionStrCache[k]);
}

fs.writeFileSync('src/tools/lexicalRules.ts', `export default ${serializedDfa};`);
console.log('词法分析器生成成功');
