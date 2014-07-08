var not_whitespace_or_end = /^(\S|$)/;
var whitespace_or_paren = /^(\s|\(|\)|$)/;

function SParser(stream) {
    this._line = this._col = this._pos = 0;
    this._stream = stream;
    var expression = this.expr();

    if (expression instanceof Error) {
        return expression;
    }

    // if anything is left to parse, it's a syntax error
    if (this.peek() != '') {
        return this.error('Syntax error: Superfluous characters after expression: `' + this.peek() + '`');
    }

    return expression;
}

SParser.prototype = {
    peek: peek,
    consume: consume,
    until: until,
    error: error,
    atom: atom,
    atomOrExpr: atomOrExpr,
    expr: expr
};

module.exports = SParser;

function peek(n) {
    n = n || 1;
    if (this._stream.length == this._pos) return '';
    if (n == 1) return this._stream[this._pos];
    return this._stream[this._pos];
}

function consume() {
    if (this._stream.length == this._pos) return '';

    var c = this._stream[this._pos];
    this._pos += 1;

    if (c == '\n' || c == '\r') {
        this._line++;
        this._col = 0;
    } else {
        this._col++;
    }

    return c;
}

function until(regex) {
    var s = '';

    while (!regex.test(this.peek())) {
        s += this.consume();
    }

    return s;
}

function error(msg) {
    var e = new Error(msg);
    e.line = this._line;
    e.col  = this._col;
    return e;
}

function atom() {
    return this.until(whitespace_or_paren);
}

function atomOrExpr() {
    if (this.peek() == '\'') {
        this.consume();
        return ['quote', this.atomOrExpr()];
    }
        
    return this.peek() == '(' ? this.expr() : this.atom();
}

function expr() {
    if (this.peek() != '(') {
        return this.error('Syntax error: Expected `(` - saw `' + this.peek() + '` instead.');
    }

    this.consume();

    // ignore whitespace
    this.until(not_whitespace_or_end);

    var ls = [];
    var v = this.atomOrExpr();

    if (v instanceof Error) {
        return v;
    }

    if (v !== '') {
        ls.push(v);

        this.until(not_whitespace_or_end); // <=> while whitespace

        while ((v = this.atomOrExpr()) !== '') {
            if (v instanceof Error) return v;
            ls.push(v);
            this.until(not_whitespace_or_end);
        }
    }

    if (this.peek() != ')') {
        return this.error('Syntax error: Expected `)` - saw: `' + this.peek() + '`');
    }

    // consume that closing paren
    this.consume();

    return ls;
}
