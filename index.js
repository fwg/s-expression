var not_whitespace_or_end = /^(\S|$)/;
var whitespace_or_paren = /^(\s|\(|\)|$)/;

function SParser(stream) {
    this._line = this._col = this._pos = 0;
    this._stream = stream;
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

module.exports = function SParse(stream) {
    var parser = new SParser(stream);
    var expression = parser.atomOrExpr();

    if (expression instanceof Error) {
        return expression;
    }

    // if anything is left to parse, it's a syntax error
    if (parser.peek() != '') {
        return parser.error('Superfluous characters at end of input: `' + parser.peek() + '`');
    }

    return expression;
};

function error(msg) {
    var e = new Error('Syntax error: ' + msg);
    e.line = this._line + 1;
    e.col  = this._col + 1;
    return e;
}

function peek() {
    if (this._stream.length == this._pos) return '';
    return this._stream[this._pos];
}

function consume() {
    if (this._stream.length == this._pos) return '';

    var c = this._stream[this._pos];
    this._pos += 1;

    if (c == '\r') {
        if (this.peek() == '\n') {
            this._pos += 1;
            c += '\n';
        }
        this._line++;
        this._col = 0;
    } else if (c == '\n') {
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

function atom() {
    return this.until(whitespace_or_paren);
}

function atomOrExpr() {
    if (this.peek() == '\'') {
        this.consume();
        // ignore whitespace
        this.until(not_whitespace_or_end);
        var quotedExpr = this.atomOrExpr();

        if (quotedExpr instanceof Error) {
            return quotedExpr;
        }

        if (quotedExpr instanceof Array) {
            quotedExpr.unshift('quote');
            return quotedExpr;
        }

        // nothing came after '
        if (quotedExpr === '') {
            return this.error('Unexpected `' + this.peek() + '` after `\'`');
        }

        return ['quote', quotedExpr];
    }

    return this.peek() == '(' ? this.expr() : this.atom();
}

function expr() {
    if (this.peek() != '(') {
        return this.error('Expected `(` - saw `' + this.peek() + '` instead.');
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
        return this.error('Expected `)` - saw: `' + this.peek() + '`');
    }

    // consume that closing paren
    this.consume();

    return ls;
}
