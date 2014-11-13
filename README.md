S-expression parser
===================

Recursive descent parser for simple S-expressions. Lists are parsed to arrays.
Atoms are parsed as strings. String literals delimited by `"` are parsed into
`String` objects to make them distinct from the other atoms. Escape sequences
`\"`, `\\`, `\n`, `\r`, `\t`, `\f`, and `\b` are supported.

Supports quote, quasiquote and unquote, with `'`, `` ` `` and `,`.

### Syntax

The parser reads one expression. Anything after the first complete expression
is a syntax error. The PEG looks like this:

    Expr       <- Space* Expr Space* / Quoted / Atom / List
    Quoted     <- ('\'' / '`' / ',') Expr
    Atom       <- String / Symbol
    List       <- '(' Expr* ')'
    String     <- '"' ('\\"' / (Char !'"'))* '"'
    Symbol     <- SymbolChar+
    SymbolChar <- '\\"' / '\\\'' / (Char !(Space / '(' / ')' / '\'' / '"'))
    Char       <- any character
    Space      <- any whitespace character in JavaScript


### Examples

    var Parse = require('s-expression');

    console.log(Parse('a')); // 'a'
    console.log(Parse("'a")); // ['quote', 'a']
    console.log(Parse('()')); // []
    console.log(Parse('(a b c)')); // ['a', 'b', 'c']
    console.log(Parse("(a 'b 'c)")); // ['a', ['quote' 'b'], ['quote', 'c']]
    console.log(Parse("(a '(b c))")); // ['a', ['quote', 'b', 'c']]
    console.log(Parse("(a `(b ,c))")); // ['a', ['quasiquote', 'b', ['unquote', 'c']]]


#### License

This software is licensed under MIT, see `LICENSE`.
