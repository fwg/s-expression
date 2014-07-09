var assert = require('assert');
var SParse = require('./');

assert.deepEqual(SParse('((a b c)(()()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse('((a b c) (() ()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse("((a 'b 'c))"), [['a',['quote','b'],['quote','c']]]);
assert.deepEqual(SParse("(a '(a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a ' (a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a '' (a b c))"), ['a', ['quote', 'quote', 'a', 'b', 'c']]);
assert(SParse("()()") instanceof Error, 'Any character after a complete expression should be an error');
assert(SParse("((a) b))") instanceof Error, 'Any character after a complete expression should be an error');
assert(SParse("((a))abc") instanceof Error, 'Any character after a complete expression should be an error');
assert(SParse("(')") instanceof Error, 'A \' without anything to quote should be an error');
assert.deepEqual(SParse("'()"), ['quote'], 'A quoted empty list should parse');
assert.deepEqual(SParse("()"), [], 'An empty list should parse');
assert.deepEqual(SParse("'a"), ['quote', 'a'], 'A quoted atom should parse');
assert.deepEqual(SParse("a"), 'a', 'An atom should parse');

var error = SParse("(\n'");
assert(error instanceof Error, "Parsing (\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 2");

error = SParse("(\r\n'");
assert(error instanceof Error, "Parsing (\\r\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 1");

assert.deepEqual(SParse('(a "a")'), ['a', new String('a')], 'Strings should parse as String objects');
assert.deepEqual(SParse('(a "\\"\n")'), ['a', new String('"\n')], 'Escaped double quotes \\" should work in Strings');
assert(SParse('(a "string)') instanceof Error, 'Prematurely ending strings should produce an error');
assert(SParse('\'"string"', ['quote', new String('string')], 'A quoted string should parse'));

assert.deepEqual(SParse('  a   '), 'a', 'Whitespace should be ignored');
assert.deepEqual(SParse('    '), '', 'The empty expression should parse')