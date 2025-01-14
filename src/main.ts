import { Lexical } from './Lexical.js';
import Parse from './SQLParser.js';
let code = `
from a select a,b,c,d
`;
let lexical = new Lexical(code);
let ret = Parse(lexical);
console.log(ret);
