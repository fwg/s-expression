'use strict';
var Parsimmon = require("parsimmon");
var regex = Parsimmon.regex;
var string = Parsimmon.string;
var optWhitespace = Parsimmon.optWhitespace;
var lazy = Parsimmon.lazy;
var seq = Parsimmon.seq;
var alt = Parsimmon.alt;

var lexeme = function(p) { return p.skip(optWhitespace); };

var number = lexeme(regex(/[0-9]+/).map(parseInt)).desc("number");

var stringLiteral = lexeme((function() {
    var escapedChar = string("\\").then(regex(/["\\]/));
    var normalChar = string("\\").atMost(1).then(regex(/[^"\\]/));
    return string('"').desc("string-opener")
        .then(normalChar.or(escapedChar).desc("string content").many())
        .skip(string('"').desc("string-terminator"))
        .map(function(s) { return new String(s.join("")); });
})());

var atom = lexeme((function() {
    var escapedChar = string('\\').then(regex(/['"\\]/));
    var initialChar = regex(/[a-z_]/i);
    var normalChar  = string('\\').atMost(1).then(regex(/\w/i));
    return seq(initialChar, normalChar.or(escapedChar).many())
        .map(function(d) {
            return d[0] + (d[1] ? d[1].join("") : "");
        }).desc("atom");
})());

var lparen = lexeme(string('(')).desc("opening paren");
var rparen = lexeme(string(')')).desc("closing paren");
var expr = lazy("sexpr", function() { return alt(form, atom, quotedExpr); });

var quote  = lexeme(regex(/('|`|,@|,)/)).desc("a quote");
var quotedExpr = quote.chain(function(quoteResult) {

    var quoteMap = {
        '\'' : 'quote',
        '`'  : 'quasiquote',
        ','  : 'unquote',
        ',@' : 'unquote-splicing'
    }

    return expr.map(function(exprResult) {
        return [ quoteMap[quoteResult] , exprResult ];
    });
});
var atom = number.or(atom).or(stringLiteral);
var form = lparen.then(expr.many()).skip(rparen);

module.exports = function(stream) {
    var s = optWhitespace.then(expr.or(optWhitespace)).parse(stream);
    if (s.status) return s.value;
    else {

        var streamSoFar = stream.slice(0, s.index);
        var line = 1 + (streamSoFar.match(/\n/g) || []).length; // Count '\n's
        var col = streamSoFar.length - streamSoFar.lastIndexOf("\n");

        var e = new Error("Syntax error at position " + s.index + ": " +
                          "(expected " + s.expected.join(" or ") + ")");
        if (s.expected.indexOf("string-terminator") >= 0)
            e.message = "Syntax error: Unterminated string literal";
        e.line = line;
        e.col = col;
        return e;
    }
};
module.exports.SyntaxError = Error;
