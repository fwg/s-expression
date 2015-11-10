S-expression parser
===================

[Recursive descent parser] [1] for [S-expressions] [2]. It takes a string and
returns the value that corresponds to one complete expression, or an `Error`.

Atoms are parsed to strings. String literals delimited by `"` are parsed into 
`String` objects to make them distinct from the other atoms. Escape sequences 
`\"`, `\\`, `\n`, `\r`, `\t`, `\f`, and `\b` are supported. Lists are parsed 
to `Array`s. Note this means that the result is not a binary tree. This also
means there are no pairs or cons cells, and the expression `(a . b)` is parsed
to `['a', '.', 'b']`.

Supports `quote`, `quasiquote`, `unquote`, and `unquote-splicing`, with `'`, `` ` ``,
`,`, and `,@` respectively.


### Example

    var parse = require('s-expression');

    console.log(parse('a')); // 'a'
    console.log(parse('(a b "c")')); // ['a', 'b', [String: 'c']]
    console.log(parse("'(a `(b ,c))")); // ['quote', ['a', ['quasiquote', ['b', ['unquote', 'c']]]]]


### Errors

The returned `Error`s have two additional properties: `line` and `col`, which
give you the line number and character column of the parse error in your input.
Line means either LF or CRLF and column means one "character" as understood by
javascript, so if you try to parse emoji, it will count them as two characters.

There are four kinds of errors:

1. An unterminated string literal.
2. Not an atom or string after a quote (`'`, `` ` ``, `,`, `,@`).
3. The input ends before the expression is complete.
4. There is more input after the expression is complete.


### Contributing

Contributions are welcome but please note that this project is meant to be a 
one-file parser without dependencies that is not too hard to understand. 


#### License

This software is licensed under MIT, see `LICENSE`.


[1]: https://en.wikipedia.org/wiki/Recursive_descent_parser "Recursive descent parser"
[2]: https://en.wikipedia.org/wiki/S-expression "S-expressions"