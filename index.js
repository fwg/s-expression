var _line, _col, _pos, _stream;
var not_whitespace = /^\S/;
var whitespace_or_close = /^(\s|\)|$)/;

function peek(n) {
    if (_stream.length == _pos) return '';
    if (n == 1) return _stream[_pos];
    if (n == 2) return _stream[_pos] + _stream[_pos + 1];
    return _stream.slice(_pos, n);
}

function consume(n) {
    if (_stream.length == _pos) return '';
    if (n == 1) {
        n = _stream[_pos];
        _pos += 1;
        if (n == '\n' || n == '\r') {
            _line++;
            _col = 0;
        } else {
            _col++;
        }
        return n;
    }

    var r = '';

    while (n > 0) {
        n--;
        r += consume(1);
    }

    return n;
}

function until_r(regex) {
    var s = '';

    while (!regex.test(peek(1))) {
        s += consume(1);
    }

    return s;
}

function while_r(regex) {
    var s = '';
    
    while (regex.test(peek(1))) {
        s += consume(1);
    }

    return s;
}

function error(msg) {
    var e = new Error(msg);
    e.line = _line;
    e.col  = _col;
}

function val() {
    return until_r(whitespace_or_close);
}

function valOrExpr() {
    return peek(1) == '(' ? expr() : val();
}

function expr() {
    if (peek(1) != '(') {
        return error('Syntax error: Expected `(` - saw `' + rest[0] + '` instead.');
    }

    consume(1);

    if (peek(1) == '(') {
        return error('Syntax error: Unexpected `(`.');
    }

    // ignore whitespace
    until_r(not_whitespace);

    var ls = [];
    var v = val();

    if (v.length) {
        ls.push(v);

        until_r(not_whitespace); // <=> while whitespace

        while ((v = valOrExpr()) != "") {
            if (v instanceof Error) return v;
            ls.push(v);
            until_r(not_whitespace);
        }
    }

    if (peek(1) != ')') {
        return error('Syntax error: Expected `)` - saw: ' + peek(1));
    }

    consume(1);

    return ls;
}


module.exports = function (stream) {
    _line = _col = _pos = 0;
    _stream = stream;
    return expr();
}

module.exports.val = val;
