var assert = require('assert');
var SParser = require('./');

assert.deepEqual(new SParser('((a b c)(()()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(new SParser('((a b c) (() ()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(new SParser("((a 'b 'c))"), [['a',['quote','b'],['quote','c']]]);
assert.deepEqual(new SParser("(a '(a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(new SParser("(a ' (a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(new SParser("(a '' (a b c))"), ['a', ['quote', 'quote', 'a', 'b', 'c']]);
assert(new SParser("()()") instanceof Error);
assert(new SParser("((a) b))") instanceof Error);
assert(new SParser("((a))abc") instanceof Error);
assert(new SParser("(')") instanceof Error);