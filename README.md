S-expression parser
===================

Recursive descent parser for simple S-expressions. Returns a nested
array of the list-like expressions. Supports quoting with `'`.

### Syntax

The parser reads one expression. Anything after the first complete expression
is a syntax error. The PEG looks like this:

    Expr       <- Space* Expr Space* / Quoted / Atom / List
    Quoted     <- '\'' Expr
    Atom       <- String / Symbol
    List       <- '(' Expr* ')'
    String     <- '"' ('\\"' / (Char !'"'))* '"'
    Symbol     <- (Char !(Space / '(' / ')'))+
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


#### License

This software is licensed under MIT, see `LICENSE`.

    (c) 2013, 2014 Friedemann Altrock 


    
