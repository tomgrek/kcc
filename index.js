var klFunctions = require('./functions');


var startAlertsAction = function(args)
{
  klFunctions.callMethod('authCheck', [''], function(err,result) {  console.log('Login result: '+result); });
  klFunctions.subscribe('messagesGivenUser', [klFunctions.userId()], klFunctions.messageAlerts);
};

var newProjectAction = function(args) {
  // args are: args[0] - projectName
  klFunctions.callMethod('newProject', [{projectName: args[0]}], function(err, res) {
    if (res.result) {
      console.log(res.message);
      console.log("'kaselab use project zig' will switch you on to that project and might be your next command.");
      klFunctions.cleanUpAndQuit();
    }
  });
}

try {

switch(process.argv[2]) {
  case 'background_alerts' : {
      klFunctions.connect(startAlertsAction,['']);
      break;
    }
  case 'help' : {
    console.log("KaseLab, communication focused project management.");
    console.log("Try:\tkaselab new project MyProject\n\tkaselab switch project MyProject\n\tkaselab start timer");
    process.exit(0);
    break;
  }
  case 'new' : {
    if (process.argv.length < 4) throw "New what?";
    switch (process.argv[3]) {
      case 'project' : {
        klFunctions.connect(newProjectAction, [process.argv[4]]);
        //process.exit(0);
        break;
      }
      default : {
        throw 'Cannot create a new '+process.argv[3];
        break;
      }
    }
    break;
  }
  default : {
    console.log("Error processing that command - try 'kaselab help'");
    process.exit(0);
    break;
  }
}

} catch(error) {
  console.log('Error processing that command.\nSpecifically: '+error+'\nYou could try just running ./kaselab with no arguments');
  process.exit(0);
}

//setTimeout(function() { messageWatcher.stop(); process.exit(0); }, 45000);
/*ddpclient.on('message', function (msg) {
  console.log("ddp message: " + msg);
});*/

//setTimeout(function() { ddpclient.close(); }, 5000);
