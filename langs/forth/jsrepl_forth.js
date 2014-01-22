(function() {
  var RESULT_SIZE;

  RESULT_SIZE = 5;

  self.JSREPLEngine = (function() {
    function JSREPLEngine(input, output, result, error, sandbox, ready) {
      var _this = this;
      this.sandbox = sandbox;
      this.printed = false;
      this.finished = false;
      this.inputting = false;
      this.lines = 0;
      this.sandbox._init();
      this.sandbox._error = function(e) {
        _this.finished = true;
        return error(e);
      };
      this.sandbox._print = function(str) {
        _this.printed = true;
        return output(str);
      };
      this.sandbox._prompt = function() {
        if (--_this.lines === 0 && !_this.inputting && !_this.finished) {
          return _this.sandbox._finish();
        }
      };
      this.sandbox._input = function(callback) {
        if (_this.finished) {
          return;
        }
        _this.inputting = true;
        return input(function(result) {
          var chr, _i, _len;
          for (_i = 0, _len = result.length; _i < _len; _i++) {
            chr = result[_i];
            _this.sandbox.inbuf.push(chr.charCodeAt(0));
          }
          _this.sandbox.inbuf.push(13);
          _this.inputting = false;
          return callback();
        });
      };
      this.sandbox._finish = function() {
        var top;
        if (_this.finished) {
          return;
        }
        _this.sandbox.inbuf = [];
        top = _this.sandbox._stacktop(RESULT_SIZE + 1);
        if (top.length) {
          if (top.length > RESULT_SIZE) {
            top[0] = '...';
          }
          result(top.join(' '));
        } else {
          if (_this.printed) {
            output('\n');
          }
          result('');
        }
        return _this.finished = true;
      };
      ready();
    }

    JSREPLEngine.prototype.Eval = function(command) {
      var e;
      this.printed = false;
      this.finished = false;
      this.inputting = false;
      this.lines = command.split('\n').length;
      try {
        return this.sandbox._run(command);
      } catch (_error) {
        e = _error;
        this.sandbox._error(e);
      }
    };

    JSREPLEngine.prototype.EvalSync = function(command) {};

    JSREPLEngine.prototype.GetNextLineIndent = function(command) {
      var countParens, parens_in_last_line,
        _this = this;
      countParens = function(str) {
        var depth, token, _i, _len, _ref;
        depth = 0;
        _ref = str.split(/\s+/);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          token = _ref[_i];
          switch (token) {
            case ':':
              ++depth;
              break;
            case ';':
              --depth;
          }
        }
        return depth;
      };
      if (countParens(command) <= 0) {
        return false;
      } else {
        parens_in_last_line = countParens(command.split('\n').slice(-1)[0]);
        if (parens_in_last_line > 0) {
          return 1;
        } else if (parens_in_last_line < 0) {
          return parens_in_last_line;
        } else {
          return 0;
        }
      }
    };

    return JSREPLEngine;

  })();

}).call(this);
