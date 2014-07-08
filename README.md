S-expression parser
===================

Recursive descent parser for simple S-expressions. Returns a nested
array of the list-like expressions. Supports quoting with `'`.

### Examples

    var Parser = require('s-expression');

    console.log(new Parser('()')); // []
    console.log(new Parser('(a b c)')); // ['a', 'b', 'c']
    console.log(new Parser("(a 'b 'c)")); // ['a', ['quote' 'b'], ['quote', 'c']]
    console.log(new Parser("(a '(b c))")); // ['a', ['quote', 'b', 'c']]


#### License

This software is licensed under MIT, see `LICENSE`.

    (c) 2013, 2014 Friedemann Altrock 


    
