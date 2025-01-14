import fs from 'fs';
import { YYTOKEN } from './SQLParser.js';
import { DFAAutomaton, DFAAutonSerializedData } from 'tslex/dist/automaton.js';
export class Lexical {
  private dfa: DFAAutomaton;
  private finished = false;
  constructor(src: string) {
    // let dfaData = fs.readFileSync('./src/dfaData.json').toString();
    // let dfaObj = JSON.parse(dfaData) as DFAAutonSerializedData;
    //这个对象使用LexicalDFAGen.ts生成的
    let dfaObj = [
      {
        edges: [
          { start: 9, end: 9, target: 1 },
          { start: 10, end: 10, target: 1 },
          { start: 13, end: 13, target: 1 },
          { start: 32, end: 32, target: 1 },
          { start: 34, end: 34, target: 2 },
          { start: 40, end: 40, target: 3 },
          { start: 41, end: 41, target: 4 },
          { start: 42, end: 42, target: 5 },
          { start: 43, end: 43, target: 6 },
          { start: 44, end: 44, target: 7 },
          { start: 45, end: 45, target: 8 },
          { start: 47, end: 47, target: 9 },
          { start: 48, end: 57, target: 10 },
          { start: 97, end: 97, target: 11 },
          { start: 98, end: 98, target: 12 },
          { start: 99, end: 99, target: 13 },
          { start: 100, end: 100, target: 14 },
          { start: 101, end: 101, target: 15 },
          { start: 102, end: 102, target: 16 },
          { start: 103, end: 103, target: 17 },
          { start: 104, end: 104, target: 18 },
          { start: 105, end: 105, target: 19 },
          { start: 106, end: 107, target: 13 },
          { start: 108, end: 108, target: 20 },
          { start: 109, end: 110, target: 13 },
          { start: 111, end: 111, target: 21 },
          { start: 112, end: 114, target: 13 },
          { start: 115, end: 115, target: 22 },
          { start: 116, end: 116, target: 23 },
          { start: 117, end: 118, target: 13 },
          { start: 119, end: 119, target: 24 },
          { start: 120, end: 122, target: 13 },
        ],
        handlers: [],
      },
      {
        edges: [
          { start: 9, end: 9, target: 25 },
          { start: 10, end: 10, target: 25 },
          { start: 13, end: 13, target: 25 },
          { start: 32, end: 32, target: 25 },
        ],
        handlers: ["function (text) { return { yytext: 'space', type: 'space', value: text, }; }"],
      },
      {
        edges: [
          { start: 0, end: 33, target: 26 },
          { start: 34, end: 34, target: 27 },
          { start: 35, end: 91, target: 26 },
          { start: 92, end: 92, target: 28 },
          { start: 93, end: 65535, target: 26 },
        ],
        handlers: [],
      },
      { edges: [], handlers: ["function (text) { return { yytext: '\\\\(', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: '\\\\)', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: '\\\\*', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: '\\\\+', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: ',', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: '\\\\-', type: text, value: text, }; }"] },
      { edges: [], handlers: ["function (text) { return { yytext: '/', type: text, value: text, }; }"] },
      {
        edges: [
          { start: 0, end: 47, target: 29 },
          { start: 48, end: 57, target: 30 },
          { start: 58, end: 65535, target: 29 },
        ],
        handlers: [],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 109, target: 31 },
          { start: 110, end: 110, target: 32 },
          { start: 111, end: 114, target: 31 },
          { start: 115, end: 115, target: 33 },
          { start: 116, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 120, target: 31 },
          { start: 121, end: 121, target: 34 },
          { start: 122, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 35 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 107, target: 31 },
          { start: 108, end: 108, target: 36 },
          { start: 109, end: 109, target: 31 },
          { start: 110, end: 110, target: 37 },
          { start: 111, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 113, target: 31 },
          { start: 114, end: 114, target: 38 },
          { start: 115, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 113, target: 31 },
          { start: 114, end: 114, target: 39 },
          { start: 115, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 97, target: 40 },
          { start: 98, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 101, target: 31 },
          { start: 102, end: 102, target: 41 },
          { start: 103, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 104, target: 31 },
          { start: 105, end: 105, target: 42 },
          { start: 106, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 113, target: 31 },
          { start: 114, end: 114, target: 43 },
          { start: 115, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 44 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 103, target: 31 },
          { start: 104, end: 104, target: 45 },
          { start: 105, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 103, target: 31 },
          { start: 104, end: 104, target: 46 },
          { start: 105, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 9, end: 9, target: 25 },
          { start: 10, end: 10, target: 25 },
          { start: 13, end: 13, target: 25 },
          { start: 32, end: 32, target: 25 },
        ],
        handlers: ["function (text) { return { yytext: 'space', type: 'space', value: text, }; }"],
      },
      {
        edges: [
          { start: 0, end: 33, target: 26 },
          { start: 34, end: 34, target: 27 },
          { start: 35, end: 91, target: 26 },
          { start: 92, end: 92, target: 28 },
          { start: 93, end: 65535, target: 26 },
        ],
        handlers: [],
      },
      { edges: [], handlers: ["function (text) {\n            return { yytext: text, type: 'string', value: text.slice(1, -1) };\n        }"] },
      {
        edges: [
          { start: 0, end: 33, target: 26 },
          { start: 34, end: 34, target: 47 },
          { start: 35, end: 91, target: 26 },
          { start: 92, end: 92, target: 28 },
          { start: 93, end: 65535, target: 26 },
        ],
        handlers: [],
      },
      { edges: [{ start: 48, end: 57, target: 48 }], handlers: [] },
      {
        edges: [
          { start: 0, end: 47, target: 29 },
          { start: 48, end: 57, target: 49 },
          { start: 58, end: 65535, target: 29 },
        ],
        handlers: [],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 99, target: 31 },
          { start: 100, end: 100, target: 50 },
          { start: 101, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 98, target: 31 },
          { start: 99, end: 99, target: 51 },
          { start: 100, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'as', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'by', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 114, target: 31 },
          { start: 115, end: 115, target: 52 },
          { start: 116, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 114, target: 31 },
          { start: 115, end: 115, target: 53 },
          { start: 116, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 99, target: 31 },
          { start: 100, end: 100, target: 54 },
          { start: 101, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 110, target: 31 },
          { start: 111, end: 111, target: 55 },
          { start: 112, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 110, target: 31 },
          { start: 111, end: 111, target: 56 },
          { start: 112, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 117, target: 31 },
          { start: 118, end: 118, target: 57 },
          { start: 119, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'if', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 108, target: 31 },
          { start: 109, end: 109, target: 58 },
          { start: 110, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 99, target: 31 },
          { start: 100, end: 100, target: 59 },
          { start: 101, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'or', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 107, target: 31 },
          { start: 108, end: 108, target: 60 },
          { start: 109, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 61 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 62 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 0, end: 33, target: 26 },
          { start: 34, end: 34, target: 27 },
          { start: 35, end: 91, target: 26 },
          { start: 92, end: 92, target: 28 },
          { start: 93, end: 65535, target: 26 },
        ],
        handlers: ["function (text) {\n            return { yytext: text, type: 'string', value: text.slice(1, -1) };\n        }"],
      },
      { edges: [{ start: 48, end: 57, target: 63 }], handlers: ["function (text) {\n            return { yytext: text, type: 'number', value: Number(text) };\n        }"] },
      {
        edges: [
          { start: 0, end: 47, target: 29 },
          { start: 48, end: 57, target: 64 },
          { start: 58, end: 65535, target: 29 },
        ],
        handlers: ["function (text) {\n            return { yytext: text, type: 'number', value: Number(text) };\n        }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'and', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'asc', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 98, target: 31 },
          { start: 99, end: 99, target: 65 },
          { start: 100, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 66 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'end', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 108, target: 31 },
          { start: 109, end: 109, target: 67 },
          { start: 110, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 116, target: 31 },
          { start: 117, end: 117, target: 68 },
          { start: 118, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 104, target: 31 },
          { start: 105, end: 105, target: 69 },
          { start: 106, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 104, target: 31 },
          { start: 105, end: 105, target: 70 },
          { start: 106, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 71 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 72 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 109, target: 31 },
          { start: 110, end: 110, target: 73 },
          { start: 111, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 113, target: 31 },
          { start: 114, end: 114, target: 74 },
          { start: 115, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      { edges: [{ start: 48, end: 57, target: 63 }], handlers: ["function (text) {\n            return { yytext: text, type: 'number', value: Number(text) };\n        }"] },
      {
        edges: [
          { start: 0, end: 47, target: 29 },
          { start: 48, end: 57, target: 64 },
          { start: 58, end: 65535, target: 29 },
        ],
        handlers: ["function (text) {\n            return { yytext: text, type: 'number', value: Number(text) };\n        }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'desc', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 104, target: 31 },
          { start: 105, end: 105, target: 75 },
          { start: 106, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'else', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'from', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 111, target: 31 },
          { start: 112, end: 112, target: 76 },
          { start: 113, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 109, target: 31 },
          { start: 110, end: 110, target: 77 },
          { start: 111, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 115, target: 31 },
          { start: 116, end: 116, target: 78 },
          { start: 117, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 113, target: 31 },
          { start: 114, end: 114, target: 79 },
          { start: 115, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 98, target: 31 },
          { start: 99, end: 99, target: 80 },
          { start: 100, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'then', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 100, target: 31 },
          { start: 101, end: 101, target: 81 },
          { start: 102, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 101, target: 31 },
          { start: 102, end: 102, target: 82 },
          { start: 103, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'group', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 102, target: 31 },
          { start: 103, end: 103, target: 83 },
          { start: 104, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'limit', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'order', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 115, target: 31 },
          { start: 116, end: 116, target: 84 },
          { start: 117, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'where', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'elseif', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'having', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
      {
        edges: [
          { start: 48, end: 57, target: 31 },
          { start: 65, end: 90, target: 31 },
          { start: 97, end: 122, target: 31 },
        ],
        handlers: ["function (text) { return { yytext: 'select', type: text, value: text, }; }", "function (text) { return { yytext: text, type: 'id', value: text, }; }"],
      },
    ];
    this.dfa = DFAAutomaton.deserialize(dfaObj);
    this.dfa.setSource(src);
    this.dfa.endHandler = () => {
      this.finished = true;
    };
  }
  yylex(): YYTOKEN {
    let genRet = (arg: YYTOKEN): YYTOKEN => {
      if (this.finished) {
        return {
          yytext: '',
          type: '$',
          value: '',
        };
      } else if (arg.type == 'space') {
        return this.yylex();
      } else {
        return arg;
      }
    };
    let ret = this.dfa.run() as YYTOKEN;
    return genRet(ret);
  }
  yyerror(msg: string) {
    console.error(`${msg}`);
  }
}
