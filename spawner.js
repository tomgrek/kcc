var klFunctions = require('./functions.js');

var startAlertsAction = function(args)
{
  klFunctions.callMethod('authCheck', [''], function(err,result) {  console.log('Login result: '+result); });
  klFunctions.subscribe('messagesGivenUser', [klFunctions.userId()], klFunctions.messageAlerts);
};

if (process.argv[2] === 'background_alerts')
{
			klFunctions.connect(startAlertsAction,['']);
}
