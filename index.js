var fs = require('fs');
var input = require('readline-sync');
var moment = require('moment');
var _ = require('underscore');
var sprintf = require('sprintf-js').sprintf;

var klFunctions = require('./functions');

var newProjectAction = function(args) {
  // args are: args[0] - projectName
  var theProject = {};
  theProject.name = args[0]; theProject.fullName = args[0]; theProject.inception = new Date();
  theProject.contributors = [{role:'creator',userId:klFunctions.userId()}];
  theProject.stakeholders = []; theProject.tasks = []; theProject.assets = []; theProject.incomes = [];
  theProject.milestones = []; theProject.documents = [];
  theProject.description = input.question('Project Description [A new project] : ', {defaultInput: 'A new project'});
  klFunctions.callMethod('newProject', [{project: theProject}], function(err, res) {
    if (err) {
      klFunctions.errorAndQuit(err);
    }
    console.log('\n'+res.message);
    klFunctions.cleanUpAndQuit();
    });
}

var syncAction = function(args) {
  console.log('Syncing...');
  klFunctions.subscribe('projects', [], function() {
      var theConfig = klFunctions.getConfig();
      var shorterList = [];
      _.forEach(klFunctions.collections().projects, function(project) {
        shorterList.push({id: project._id, name: project.name, fullName: project.fullName, description: project.description});
      });
      console.log(sprintf('Active Projects:\n%-25s %-30s\n%-25s %-30s',"Name","Description","-----","-----"));
      _.forEach(shorterList, function(project) {
        console.log(sprintf("%-25s %-30s",project.name,project.description));
      });
      theConfig.projectList = shorterList;
      klFunctions.writeConfig(theConfig);
      process.exit(0);
    }
  );
}

try {

switch(process.argv[2]) {
  case 'start' : {
      if (process.argv[3] === 'background_alerts') {
        var theProcess = klFunctions.spawnBackgroundAlerts();
    		if (theProcess) {
    			console.log("Starting KaseLab background alerts...");
    			var config = klFunctions.getConfig();
    			config.alertsProcess = theProcess.pid;
    			klFunctions.writeConfig(config);
    			klFunctions.cleanUpAndQuit();
    		}
    		else {
    			console.log("Could not start background alerts.");
    			klFunctions.cleanUpAndQuit();
    		}
      }
      if (process.argv[3] === 'timer') {
        var config = klFunctions.getConfig();
        if (!config.timer)
          config.timer = [{project:{id:config.activeProjectId, name:config.activeProjectName}, start: new Date()}];
        else {
          var openProjectTimer = {};
          if (!_.every(config.timer, function(entry) { openProjectTimer = entry; return entry.hasOwnProperty('start') && entry.hasOwnProperty('end')})) {
            klFunctions.errorAndQuit({error:400, reason:'Another timer is still open', details: 'Use kaselab stop timer '+openProjectTimer.project.name+' "[hh:mm YYYY/MM/dd]" first.\n'})
          }
          config.timer.push({project:{id:config.activeProjectId, name:config.activeProjectName}, start: new Date()});
        }
        console.log("\nStarting KaseLab time tracker for project "+config.activeProjectName+" at "+moment(config.timer[config.timer.length-1].start).format("HH:mm YYYY/MMMM/D")+".\n");
        klFunctions.writeConfig(config);
        klFunctions.cleanUpAndQuit();
      }
      break;
    }
  case 'stop' : {
      if (process.argv[3] === 'timer') {
        var config = klFunctions.getConfig();
        if (process.argv[4]) {
          if (!process.argv[5] || process.argv[6])
            klFunctions.errorAndQuit({error:400, reason:'Specify stop time', details:'Usage: kaselab stop timer [project name] "[hh:mm YYYY/MM/dd]" (in quotation marks).'});
          klFunctions.cleanUpAndQuit();
        }
        config.timer[config.timer.length-1].end = new Date();
        klFunctions.writeConfig(config);
        var timeDifference = moment(config.timer[config.timer.length-1].end) - moment(config.timer[config.timer.length-1].start);
        timeDifference = moment.duration(timeDifference);
        timeDifference = timeDifference.hours() + ':' + timeDifference.minutes();
        console.log('\nStopped KaseLab time tracker for project '+config.activeProjectName+' at '+moment(config.timer[config.timer.length-1].end).format("HH:mm YYYY/MMMM/D")+', you spent '+timeDifference+'.\n');
        console.log('Use "kaselab sync" to update the project online.\n')
        klFunctions.cleanUpAndQuit();
      }
      if (process.argv[3] === 'background_alerts') {
    		var config = klFunctions.getConfig();
    		if (config.process) {
    			try {
    				process.kill(config.alertsProcess, 'SIGTERM');
    				delete config.alertsProcess;
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
  case 'sync' : {
    klFunctions.connect(syncAction, []);
    break;
  }
  case 'help' : {
    console.log("KaseLab, communication focused project management.");
    console.log("Try:\tkaselab new project MyProject\n\tkaselab switch project MyProject\n\tkaselab start timer");
    console.log('kaselab start background_alerts :\tstart the background alerts process\n\t\t\t\t\t(notifies you of changes to a project you are subscribed to.)');
    console.log('kaselab stop background_alerts :\tstop the background alerts process.');
    klFunctions.cleanUpAndQuit();
    break;
  }
  case 'use' : {
    switch (process.argv[3]) {
      case 'project' : {
        var checkLocal = klFunctions.getProjectIdLocally({name:process.argv[4]});
        if (checkLocal.result) {
          var theConfig = klFunctions.getConfig();
          theConfig.activeProjectId = checkLocal.id;
          theConfig.activeProjectName = checkLocal.projectName;
          klFunctions.writeConfig(theConfig);
          console.log(checkLocal.message);
          klFunctions.cleanUpAndQuit();
        } else {
        klFunctions.errorAndQuit({error:400, reason: 'No record of that project', details: checkLocal.message});
        }
        break;
      }
      default : {
        throw 'Cannot use '+process.argv[3];
        break;
      }
    }
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
