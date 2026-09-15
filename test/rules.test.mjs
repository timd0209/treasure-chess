import assert from 'node:assert/strict';
import {initialState,perft} from '../src/rules.js';
const s=initialState();
assert.equal(perft(s,1),20);
assert.equal(perft(s,2),400);
assert.equal(perft(s,3),8902);
console.log('Perft passed: 20, 400, 8902');
