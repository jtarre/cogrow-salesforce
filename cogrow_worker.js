var worker  = require('node_helper');
var jsforce = require('jsforce');

var campaignId;

var conn;
// console.log("Hello world from Node.js");
console.log("params:", worker.params);
console.log("login params", worker.config.LOGIN_URL);

conn = new jsforce.Connection({
    loginUrl : worker.config.LOGIN_URL,
    clientSecret: worker.config.CLIENT_SECRET, 
    redirectUri: worker.config.REDIRECT_URI,
    clientId: worker.config.CLIENT_ID,
    instanceUrl: worker.config.INSTANCE_URL
});

conn.log(worker.config.USER_EMAIl, worker.config.PASSWORD, function(err, userInfo) {
	if(err) {return console.error(err);}
	console.log(userInfo);
})

campaignId = worker.params.campaignId;
console.log("Please be so kind and tell me the campaign id:", campaignId);
console.log("config:", worker.config);
console.log("task_id:", worker.task_id);
