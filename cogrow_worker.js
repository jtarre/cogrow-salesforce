var worker  = require('node_helper');
var jsforce = require('jsforce');

var campaignId, first, last, school, year;
var candidateStatus, candidateId;


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
	// what would be the next thing
	// well first i'd want to get campaign id and the vars.

	// then i want to check if the candidate exists
	// i also want to make sure that i can pass
	// the connection value to a function and it will still work

	var createNewLead = function(conn, email, last, school) {
		conn.sobject("Lead").create({ 
			LastName:  last,
			Email:     email,
			Company:   school
		}, function(err, ret) {
			if (err) {console.error(err); }
			console.log("new lead return values", ret);
			// return ret.Id;
		});
	};

	var checkCandidateStatus = function(conn, email) {
		conn.sobject("Lead")
			.find({
				Email: email
			}, "Id, Email, FirstName, LastName")
			.execute( function (err, leads) {
				console.log("leads", leads);
				if(leads){
					return leads[0].Id;
				} else {
					return false;
				}
			});
	};

	var createCampaignMember = function(conn, campaignId, candidateId) {
		conn.sobject("CampaignMember").create({
			CampaignId: campaignId,
			Lead: candidateId
		}, function(err, ret) {
			if (err) {console.error(err);}
			console.log("campaign member", ret);
		});
	};

	candidateId = checkCandidateStatus(conn, "darrenadouglas@gmail.com");
	if(!candidateId) {
		candidateId = createNewLead(conn, "jason+cg1@ventureforamerica.org", "Tarre", "WashU");
		createCampaignMember(conn, "701d0000001IkTj", "00Qd000000VApd7");
	} else {
		createCampaignMember(conn, "701d0000001IkTj", "00Qd000000VApd7");
	}
	// console.log("candidate exists?", candidateId);
});

campaignId = worker.params.campaignId;
console.log("Please be so kind and tell me the campaign id:", campaignId);
// console.log("config:", worker.config);
console.log("task_id:", worker.task_id);
