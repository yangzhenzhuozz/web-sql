import { ExpNode, WindowFrame } from './ExpTree.js';

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw msg;
  }
}
export function isWindowFrame(obj: ExpNode | WindowFrame): obj is WindowFrame {
  if ((<WindowFrame>obj).windowFunction != undefined) {
    return true;
  } else {
    return false;
  }
}
