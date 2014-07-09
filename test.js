var assert = require('assert');
var SParse = require('./');

assert.deepEqual(SParse('((a b c)(()()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse('((a b c) (() ()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse("((a 'b 'c))"), [['a',['quote','b'],['quote','c']]]);
assert.deepEqual(SParse("(a '(a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a ' (a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a '' (a b c))"), ['a', ['quote', 'quote', 'a', 'b', 'c']]);
assert(SParse("()()") instanceof Error);
assert(SParse("((a) b))") instanceof Error);
assert(SParse("((a))abc") instanceof Error);
assert(SParse("(')") instanceof Error);
assert.deepEqual(SParse("'()"), ['quote']);
assert.deepEqual(SParse("()"), []);
assert.deepEqual(SParse("'a"), ['quote', 'a']);
assert.deepEqual(SParse("a"), 'a');

var error = SParse("(\n'");
assert(error instanceof Error, "Parsing (\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 2");

error = SParse("(\r\n'");
assert(error instanceof Error, "Parsing (\\r\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 1");