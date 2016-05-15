var fs = require('fs');

spawn = require('child_process').spawn;

if (process.argv.length < 3) {
	console.log('KaseLab v0.0.1\nUsage:');
	console.log('kaselab start background_alerts :\tstart the background alerts process\n\t\t\t\t\t(notifies you of changes to a project you are subscribed to.)');
	console.log('kaselab stop background_alerts :\tstop the background alerts process.');
	process.exit(0);
}

if (process.argv[2] === 'start')
{
	if (process.argv[3] === 'background_alerts')
	{
		theProcess = spawn('nodejs', ['index.js', 'background_alerts'], {
		  detached: true,
		  stdio: ['ignore',1,2]
		});
		if (theProcess) {
			console.log("Started KaseLab background alerts.");
			var conf_file = fs.readFileSync('../.kaselab.conf'); //NB: hardcoded link BAD
			var config = JSON.parse(conf_file);
			config.process = theProcess.pid;
			fs.writeFileSync('../.kaselab.conf', JSON.stringify(config));
			process.exit(0);
		}
		else {
			console.log("Could not start background alerts.");
			process.exit(0);
		}
	}
}
if (process.argv[2] === 'stop')
{
	if (process.argv[3] === 'background_alerts') {
		var conf_file = fs.readFileSync('../.kaselab.conf'); //BAD
		var theConf = JSON.parse(conf_file);
		if (theConf.process) {
			try {
				process.kill(theConf.process, 'SIGTERM');
				delete theConf.process;
				fs.writeFileSync('../.kaselab.conf', JSON.stringify(theConf));
				console.log('Stopping KaseLab background alerts.');
			} catch(err) {
				console.log('Error stopping the background alerts process.');
			}

			process.exit(0);
		}
		else {
			console.log("KaseLab isn't currently showing background alerts.");
			process.exit(0);
		}
	}
}

spawn('nodejs', ['index.js'].concat(process.argv.slice(2)), {
	detached: true,
	stdio: [0,1,2]
});
