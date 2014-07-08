S-expression parser
===================

Recursive descent parser for simple S-expressions. Returns a nested
array of the list-like expressions. Supports quoting with `'`.

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


    
