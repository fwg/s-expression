var assert = require('assert');
var SParse = require(process.cwd() + '/');
var SyntaxError = SParse.SyntaxError;

assert.deepEqual(SParse('((a b c)(()()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse('((a b c) (() ()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse("((a 'b 'c))"), [['a',['quote','b'],['quote','c']]]);
assert.deepEqual(SParse("(a '(a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a ' (a b c))"), ['a', ['quote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a '' (a b c))"), ['a', ['quote', ['quote', 'a', 'b', 'c']]], 'Multiple quotes should not be flattened');
assert.deepEqual(SParse("((a `b `c))"), [['a',['quasiquote','b'],['quasiquote','c']]]);
assert.deepEqual(SParse("(a `(a b c))"), ['a', ['quasiquote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a ` (a b c))"), ['a', ['quasiquote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a `` (a b c))"), ['a', ['quasiquote', ['quasiquote', 'a', 'b', 'c']]], 'Multiple quasiquotes should not be flattened');
assert.deepEqual(SParse("((a ,b ,c))"), [['a',['unquote','b'],['unquote','c']]]);
assert.deepEqual(SParse("(a ,(a b c))"), ['a', ['unquote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a , (a b c))"), ['a', ['unquote', 'a', 'b', 'c']]);
assert.deepEqual(SParse("(a ,, (a b c))"), ['a', ['unquote', ['unquote', 'a', 'b', 'c']]], 'Multiple unquotes should not be flattened');
assert(SParse("((a) b))") instanceof SyntaxError, 'Unbalanced parens should be an error');
assert(SParse("(')") instanceof SyntaxError, 'A \' without anything to quote should be an error');
assert.deepEqual(SParse("'()"), ['quote'], 'A quoted empty list should parse');
assert.deepEqual(SParse("()"), [], 'An empty list should parse');
assert.deepEqual(SParse("'a"), ['quote', 'a'], 'A quoted atom should parse');
assert.deepEqual(SParse("a"), 'a', 'An atom should parse');
assert.deepEqual(SParse("(a'b)"), ['a', ['quote', 'b']], 'Quotes should act symbol delimiting');
assert.deepEqual(SParse("(a\\'b)"), ['a\'b'], 'Escaped quotes in symbols should parse');
assert.deepEqual(SParse("(a\\\"b)"), ['a\"b'], 'Escaped quotes in symbols should parse');
assert.deepEqual(SParse("(a\\\\b)"), ['a\\b'], 'Escaped \\ in symbols should parse as \\');
assert.deepEqual(SParse("(a\\b)"), ['ab'], 'Escaped normal characters in symbols should parse as normal');

assert.deepEqual(SParse("(a)(b)"), [['a'], ['b']]);
assert.deepEqual(SParse("(a)    (b)"), [['a'], ['b']]);
assert.deepEqual(SParse("(a) abc"), [['a'], 'abc']);
assert(SParse("(a) (") instanceof SyntaxError);

var error = SParse("(\n'");
assert(error instanceof SyntaxError, "Parsing (\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 2");

error = SParse("(\r\n'");
assert(error instanceof SyntaxError, "Parsing (\\r\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 1");

assert.deepEqual(SParse('(a "a")'), ['a', new String('a')], 'Strings should parse as String objects');
assert.deepEqual(SParse('(a"s"b)'), ['a', new String('s'), 'b'], 'Strings should act symbol delimiting');
assert.deepEqual(SParse('(a\\"s\\"b)'), ['a"s"b'], 'Escaped double quotes in symbols should parse');
assert.deepEqual(SParse('(a "\\"\n")'), ['a', new String('"\n')], 'Escaped double quotes \\" should work in Strings');
assert.deepEqual(SParse('(a "\\\\")'), ['a', new String('\\')], 'Escaped \\ should work in Strings');
assert.deepEqual(SParse('(a "\\a")'), ['a', new String('a')], 'Escaped characters should work in Strings');
assert(SParse('(a "string)') instanceof SyntaxError, 'Prematurely ending strings should produce an error');
assert(SParse('\'"string"', ['quote', new String('string')], 'A quoted string should parse'));

error = SParse("(\"a)");
assert(error instanceof SyntaxError);
assert(error.message == "Syntax error: Unterminated string literal", error.message);

assert.deepEqual(SParse('  a   '), 'a', 'Whitespace should be ignored');
assert.deepEqual(SParse('    '), '', 'The empty expression should parse');
