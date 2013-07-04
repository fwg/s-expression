var _line, _col, _pos, _stream;
var not_whitespace_or_end = /^(\S|$)/;
var whitespace_or_close = /^(\s|\)|$)/;

function peek() {
    if (_stream.length == _pos) return '';
    return _stream[_pos];
}

function consume() {
    if (_stream.length == _pos) return '';

    var c = _stream[_pos];
    _pos += 1;

    if (c == '\n' || c == '\r') {
        _line++;
        _col = 0;
    } else {
        _col++;
    }

    return c;
}

function until(regex) {
    var s = '';

    while (!regex.test(peek())) {
        s += consume();
    }

    return s;
}

function error(msg) {
    var e = new Error(msg);
    e.line = _line;
    e.col  = _col;
    return e;
}

function val() {
    return until(whitespace_or_close);
}

function valOrExpr() {
    return peek() == '(' ? expr() : val();
}

function expr() {
    if (peek() != '(') {
        return error('Syntax error: Expected `(` - saw `' + peek() + '` instead.');
    }

    consume();

    // ignore whitespace
    until(not_whitespace_or_end);

    var ls = [];
    var v = valOrExpr();

    if (v !== '') {
        ls.push(v);

        until(not_whitespace_or_end); // <=> while whitespace

        while ((v = valOrExpr()) !== '') {
            if (v instanceof Error) return v;
            ls.push(v);
            until(not_whitespace_or_end);
        }
    }

    if (peek() != ')') {
        return error('Syntax error: Expected `)` - saw: `' + peek() + '`');
    }

    // consume that closing paren
    consume();

    return ls;
}


module.exports = function (stream) {
    _line = _col = _pos = 0;
    _stream = stream;
    return expr();
}
