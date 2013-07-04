var SParser = require('./');

console.log(new SParser('((a b c)(()()))'));
console.log(new SParser('((a b c) (() ()))'));
console.log(new SParser("((a 'b 'c))"));
console.log(new SParser("(a '(a b c))"));
console.log(new SParser("(a ' (a b c))"));
console.log(new SParser("(a '' (a b c))"));
