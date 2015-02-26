var assert = require('assert');
var equal = assert.deepEqual;

// Require the current working directory package so one can test different parsers.
var SParse = require(process.cwd() + '/');
var SyntaxError = SParse.SyntaxError;

// Command options to disable specific tests: -quote -unquote -quasiquote -error
var options = process.argv.slice(2).reduce(function (options, opt) {
    options[opt] = true;
    return options;
}, {});

if (!options['-error']) {
    assert(typeof SyntaxError == 'function', 'The parser should expose a SyntaxError constructor');
}

// valid: atoms and lists
equal(SParse('    '), '', 'The empty expression should parse');
equal(SParse("a"), 'a', 'An atom should parse');
equal(SParse('  a   '), 'a', 'Whitespace should be ignored');
equal(SParse("()"), [], 'An empty list should parse');
equal(SParse('((a b c)(()()))'), [['a','b','c'],[[],[]]], 'Nested expressions should parse');
equal(SParse('((a b c) (() ()))'), [['a','b','c'],[[],[]]], 'Insignificant whitespace should be ignored');

// valid: strings and escaping
equal(SParse('(a "a")'), ['a', new String('a')], 'Strings should parse as String objects');
equal(SParse('(a"s"b)'), ['a', new String('s'), 'b'], 'Strings should act symbol delimiting');
equal(SParse('(a\\"s\\"b)'), ['a"s"b'], 'Escaped double quotes in symbols should parse');
equal(SParse('(a "\\"\n")'), ['a', new String('"\n')], 'Escaped double quotes \\" should work in Strings');
equal(SParse('(a "\\\\")'), ['a', new String('\\')], 'Escaped \\ should work in Strings');
equal(SParse('(a "\\a")'), ['a', new String('a')], 'Escaped characters should work in Strings');

equal(SParse("(a\\b)"), ['ab'], 'Escaped normal characters in symbols should parse as normal');
equal(SParse("(a\\\"b)"), ['a\"b'], 'Escaped string quotes in symbols should parse');
equal(SParse("(a\\\\b)"), ['a\\b'], 'Escaped backslash in symbols should parse');

// valid: quotes
function testQuote(quote, name) {
    equal(SParse(quote + 'a'), [name, 'a'], 'A ' + quote + '-quoted atom should parse');
    equal(SParse(quote + "()"), [name], 'A ' + quote + '-quoted empty list should parse');
    equal(SParse(quote + '"string"'), [name, new String('string')], 'A ' + quote + '-quoted string should parse');
    equal(SParse('(a' + quote + 'b)'), ['a', [name, 'b']], quote + '-quotes should act symbol delimiting');
    equal(SParse('((a ' + quote + 'b))'), [['a',[name,'b']]], 'Atoms should be ' + quote + '-quotable in lists');
    equal(SParse('(a ' + quote + '(a b c))'), ['a', [name, 'a', 'b', 'c']], 'Lists should be ' + quote + '-quotable');
    equal(SParse('(a ' + quote + ' (a b c))'), ['a', [name, 'a', 'b', 'c']], 'Whitespace between the ' + quote + '-quote and the thing to be quoted should be ignored');
    equal(SParse('(a ' + quote + quote + ' (a b c))'), ['a', [name, [name, 'a', 'b', 'c']]], 'Multiple ' + quote + '-quotes should not be flattened');
    equal(SParse('(a\\' + quote + 'b)'), ['a' + quote + 'b'], 'Escaped ' + quote + '-quotes in symbols should parse');

    if (!options['-error'] && SyntaxError) {
        assert(SParse('(' + quote + ')') instanceof SyntaxError, 'A ' + quote + ' without anything to quote should be an error');
    }
}

if (!options['-quote']) {
    testQuote("'", 'quote');
}
if (!options['-unquote']) {
    testQuote(',', 'unquote');
}
if (!options['-quasiquote']) {
    testQuote('`', 'quasiquote');
}
if (!options['-unquote-splicing']) {
    testQuote(',@', 'unquote-splicing');
}

// invalid expressions
if (!options['-error'] && SyntaxError) {
    assert(SParse("()()") instanceof SyntaxError, 'Any character after a complete expression should be an error');
    assert(SParse("((a) b))") instanceof SyntaxError, 'Any character after a complete expression should be an error');
    assert(SParse("((a))abc") instanceof SyntaxError, 'Any character after a complete expression should be an error');
    assert(SParse('(a "string)') instanceof SyntaxError, 'Prematurely ending strings should produce an error');
    
    var error = SParse("(\n'");
    assert(error instanceof SyntaxError, "Parsing (\\n' Should be an error");
    assert(error.line == 2, "line should be 2");
    assert(error.col == 2, "col should be 2");
    
    error = SParse("(\r\n'");
    assert(error instanceof SyntaxError, "Parsing (\\r\\n' Should be an error");
    assert(error.line == 2, "line should be 2");
    assert(error.col == 2, "col should be 1");
}

