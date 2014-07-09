var not_whitespace_or_end = /^(\S|$)/;
var whitespace_or_paren = /^(\s|\(|\)|$)/;
var string_or_escaped_or_end = /^(\\|"|$)/;

function SParser(stream) {
    this._line = this._col = this._pos = 0;
    this._stream = stream;
}

SParser.prototype = {
    peek: peek,
    consume: consume,
    until: until,
    error: error,
    string: string,
    atom: atom,
    quoted: quoted,
    expr: expr,
    list: list
};

module.exports = function SParse(stream) {
    var parser = new SParser(stream);
    var expression = parser.expr();

    if (expression instanceof Error) {
        return expression;
    }

    // if anything is left to parse, it's a syntax error
    if (parser.peek() != '') {
        return parser.error('Superfluous characters after expression: `' + parser.peek() + '`');
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

function string() {
    // consume "
    this.consume();

    var str = '';

    while (true) {
        str += this.until(string_or_escaped_or_end);
        var next = this.peek();

        if (next == '') {
            return this.error('Unterminated string literal');
        }

        if (next == '"') {
            this.consume();
            break;
        }

        if (next == '\\') {
            this.consume();

            if (this.peek() == '"') {
                this.consume();
                str += '"';
            } else {
                str += '\\';
            }
        }
    }

    // wrap in object to make strings distinct from symbols
    return new String(str);
}

function atom() {
    if (this.peek() == '"') {
        return this.string();
    }

    return this.until(whitespace_or_paren);
}

function quoted() {
    this.consume();

    // ignore whitespace
    this.until(not_whitespace_or_end);
    var quotedExpr = this.expr();

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

function expr() {
    // ignore whitespace
    this.until(not_whitespace_or_end);

    if (this.peek() == '\'') {
        return this.quoted();
    }

    var expr = this.peek() == '(' ? this.list() : this.atom();

    // ignore whitespace
    this.until(not_whitespace_or_end);

    return expr;
}

function list() {
    if (this.peek() != '(') {
        return this.error('Expected `(` - saw `' + this.peek() + '` instead.');
    }

    this.consume();

    var ls = [];
    var v = this.expr();

    if (v instanceof Error) {
        return v;
    }

    if (v !== '') {
        ls.push(v);

        while ((v = this.expr()) !== '') {
            if (v instanceof Error) return v;
            ls.push(v);
        }
    }

    if (this.peek() != ')') {
        return this.error('Expected `)` - saw: `' + this.peek() + '`');
    }

    // consume that closing paren
    this.consume();

    return ls;
}
