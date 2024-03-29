
MKSjsrepl = function(id) {


  var html ='<table><tr><td><img src="play_button.png" id="' + id + '-run" class="run" /><div id="' + id + '-editor" class="editor"></div></td><td><div id="' + id + '-console" class="console"></div></td></tr></table>'

  $("#" + id).html(html)

  var eid = id + '-editor'
  var cid = id + '-console'

  var jqconsole = $("#" + cid).jqconsole();
  var editor = ace.edit(eid);
  editor.getSession().setMode("ace/mode/javascript");

  function log() {
    console.log(arguments);
  }

  var ResultCallback = function(result) {
    if (result) {
      if (result[-1] !== '\n') {
        result = result + '\n';
      }
      jqconsole.Write('=> ' + result, 'jqconsole-output');
    } else {
      jqconsole.Write('=> undefined\n', 'jqconsole-output')
    }
    return;
  }

  var InputCallback = function(callback) {
    jqconsole.Input(function(result) {
      var e;
      try {
        callback(result);
      } catch (_error) {
        e = _error;
        console.log(e);
      }
    });
    return;
  }

  var ErrorCallback = function(error) {
    if (typeof error === 'object') {
      error = error.message;
    }
    if (error[-1] !== '\n') {
      error = error + '\n';
    }
    jqconsole.Write(String(error), 'jqconsole-error');
    return;
  }

  var OutputCallback = function(output, cls) {
    if (output) {
      jqconsole.Write(output, "jqconsole-output");
      return;
    }
  }

  var jsrepl = new JSREPL({
    input: InputCallback,
    output: OutputCallback,
    result: ResultCallback,
    error: ErrorCallback,
    progress: log,
    timeout: {
      time: 30000,
      callback: log
    }
  });

  jsrepl.loadLanguage("javascript");

  var startPrompt = function () {
    jqconsole.Prompt(true, function (input) {
      jsrepl["eval"](input);
      startPrompt();
    });
  };

  startPrompt();
  $("#" + id + "-run").click(function(){
    jsrepl.eval(editor.getValue());
    console.log("click");
  });

  return {
    eval: function(command){
      jsrepl.eval(command);
    },

    setEditorText: function(code){
      editor.setValue(code);
    }
  };

}


