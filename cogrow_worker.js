var worker  = require('node_helper');
var jsforce = require('jsforce');

var campaignId = worker.params.campaignId;
var last       = worker.params.last;
var email      = worker.params.email;
var school      = worker.params.school;

var first, year;
var candidate, candidateId;


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

conn.login(worker.config.USER_EMAIL, worker.config.PASSWORD, function(err, userInfo) {
	if(err) {return console.error(err);}
	console.log(userInfo);

	var createCampaignMember = function createCampaignMember(conn, campaignId, candidateId) {
		console.log("Let's make a campaign member!");
		conn.sobject("CampaignMember").create({
			CampaignId: campaignId,
			LeadId: candidateId
		}, function(err, ret) {
			if (err) {console.error(err);}
			console.log("campaign member", ret);
		});
	};

	var createNewLead = function createNewLead(conn, email, last, school, campaignId, callback) {
		conn.sobject("Lead").create({ 
			LastName:  last,
			Email:     email,
			Company:   school
		}, function(err, ret) {
			if (err) {console.error(err); }
			console.log("new lead return values", ret);
			callback(conn, campaignId, ret.id)
			// return ret.Id;
		});
	};

	var getCandidate = function getCandidate(conn, email, last, school, campaignId, callback1, callback2) {
		conn.sobject("Lead")
			.find({
				Email: email
			}, "Id, Email, FirstName, LastName")
			.execute( function (err, leads) {
				if(err) {console.error(err)};
				console.log("leads exist?", leads);
				if(leads.length){
					callback1(conn, campaignId, leads[0].Id);
					// return leads[0];
				} else {
					callback2(conn, email, last, school, campaignId, callback1);
					// return false;
				}
			});
	};

	candidate = getCandidate(conn, email, last, school, campaignId, createCampaignMember, createNewLead);
});

campaignId = worker.params.campaignId;
console.log("Please be so kind and tell me the campaign id:", campaignId);
// console.log("config:", worker.config);
console.log("task_id:", worker.task_id);
