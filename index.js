var fs = require('fs');

var klFunctions = require('./functions');

var newProjectAction = function(args) {
  // args are: args[0] - projectName
  klFunctions.callMethod('newProject', [{projectName: args[0]}], function(err, res) {
    if (res.result) {
      console.log(res.message);
      console.log("'kaselab use project "+args[0]+"' will switch you on to that project and might be your next command.");
      klFunctions.cleanUpAndQuit();
    }
  });
}

try {

switch(process.argv[2]) {
  case 'start' : {
      if (process.argv[3] == 'background_alerts') {
        var theProcess = klFunctions.spawnBackgroundAlerts();
    		if (theProcess) {
    			console.log("Starting KaseLab background alerts...");
    			var config = klFunctions.getConfig();
    			config.process = theProcess.pid;
    			klFunctions.writeConfig(config);
    			klFunctions.cleanUpAndQuit();
    		}
    		else {
    			console.log("Could not start background alerts.");
    			klFunctions.cleanUpAndQuit();
    		}
      }
      break;
    }
  case 'stop' : {
      if (process.argv[3] === 'background_alerts') {
    		var config = klFunctions.getConfig();
    		if (config.process) {
    			try {
    				process.kill(config.process, 'SIGTERM');
    				delete config.process;
    				klFunctions.writeConfig(config);
    				console.log('Stopping KaseLab background alerts.');
    			} catch(err) {
    				console.log('Error stopping the background alerts process.');
    			}
    			klFunctions.cleanUpAndQuit();
    		}
    		else {
    			console.log("KaseLab isn't currently showing background alerts.");
    			klFunctions.cleanUpAndQuit();
    		}
    	}
  }
  case 'help' : {
    console.log("KaseLab, communication focused project management.");
    console.log("Try:\tkaselab new project MyProject\n\tkaselab switch project MyProject\n\tkaselab start timer");
    console.log('kaselab start background_alerts :\tstart the background alerts process\n\t\t\t\t\t(notifies you of changes to a project you are subscribed to.)');
    console.log('kaselab stop background_alerts :\tstop the background alerts process.');
    klFunctions.cleanUpAndQuit();
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
    klFunctions.cleanUpAndQuit();
    break;
  }
}

} catch(error) {
  console.log('Error processing that command.\nSpecifically: '+error+'\nYou could try just running ./kaselab with no arguments');
  klFunctions.cleanUpAndQuit();
}

//setTimeout(function() { messageWatcher.stop(); process.exit(0); }, 45000);
/*ddpclient.on('message', function (msg) {
  console.log("ddp message: " + msg);
});*/

//setTimeout(function() { ddpclient.close(); }, 5000);
