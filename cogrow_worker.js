// var worker  = require('node_helper');
// var worker = {};
var jsforce = require('jsforce');
var _  = require('lodash');


// var campaignId;
// var first;
// var last;
// var email;
// var major;
// var school;
// var year;


// var campaignId = worker.params.campaignId || "701d0000001JJ9b";
// console.log("Please be so kind and tell me the campaign id:", campaignId);
// var last       = worker.params.last || "Tarre";
// var email      = worker.params.email || "Jason@ventureforamerica.org";
// var school      = worker.params.school || "Wash U";

// var candidateId;
var campaignId = "701d0000001JJ9b";
console.log("Please be so kind and tell me the campaign id:", campaignId);
var last       = "Tarre";
var email      = "Jason@ventureforamerica.org";
var school      = "Wash U";

var workerParams = {last: last, email: email, school: school, campaignId: campaignId};

var availableSfData = [
	{sf: "FirstName", params: "first"},
	{sf: "LastName", params: "last"},
	{sf: "Email", params: "email"},
	{sf: 'Major__c', params: 'major'},
	{sf: 'Graduation_Year__c', params: 'gradYear'},
	{sf: 'School_Text_FR__c', params: 'school'}
	];

var createCandidateObj = function createCandidateObj(candidate, availableSfData, workerParams) {
	var candidateParamsValue;
	var salesforceFieldName;
	 _.forEach(availableSfData, function(value, index) {
	 	candidateParamsValue = value.params;
	 	salesforceFieldName = value.sf;
		if(workerParams[candidateParamsValue]) {
			candidate[salesforceFieldName] = workerParams[candidateParamsValue];
		}
 	});

 	return candidate;	
};

var candidate = {};
candidate = createCandidateObj(candidate, availableSfData, workerParams);
console.log("candidate object", candidate);

/*
{
"USER_EMAIL": "jason@ventureforamerica.org",
"PASSWORD": "1010Boobooboo!!1010",
"INSTANCE_URL": "https://na14.salesforce.com/",
"CLIENT_SECRET": "4767192206007523209",
"CLIENT_ID": "3MVG9rFJvQRVOvk6KGm7WX.DOBEBOr701sDMIfbMTc24Y9Dzy2lVHwadn.FsVxVXXWhL5s7Jje0tS063s_gQV",
"LOGIN_URL": "https://login.salesforce.com/",
"REDIRECT_URI": "http://localhost:3000/oauth/_callback"
}
 */

// var conn = new jsforce.Connection({
//     loginUrl : worker.config.LOGIN_URL,
//     clientSecret: worker.config.CLIENT_SECRET, 
//     redirectUri: worker.config.REDIRECT_URI,
//     clientId: worker.config.CLIENT_ID,
//     instanceUrl: worker.config.INSTANCE_URL
// });

var conn = new jsforce.Connection({
    loginUrl : "https://login.salesforce.com/",
    clientSecret: "4767192206007523209",
    redirectUri: "http://localhost:3000/oauth/_callback",
    clientId: "3MVG9rFJvQRVOvk6KGm7WX.DOBEBOr701sDMIfbMTc24Y9Dzy2lVHwadn.FsVxVXXWhL5s7Jje0tS063s_gQV",
    instanceUrl: "https://na14.salesforce.com/"
});
conn.login("jason@ventureforamerica.org", "1010Boobooboo!!1010", function(err, userInfo) {
// conn.login(worker.config.USER_EMAIL, worker.config.PASSWORD, function(err, userInfo) {
	if(err) {return console.error(err);}
	console.log(userInfo);

	var createCampaignMember = function createCampaignMember(conn, campaignId, candidateId) {
		console.log("Let's make a campaign member!");
		conn.sobject("CampaignMember")
			.find({
				CandidateId: candidateId
			}, "*")
			.execute(function(err, campaignMembers) {
				if(!campaignMembers.length) { // candidate doesn't already exist as a campaign member
					console.log("Candidate is not a campaign dupe!")
					conn.sobject("CampaignMember").create({ // create a campaign member
						CampaignId: campaignId,
						LeadId: candidateId
					}, function(err, ret) {
						if (err) {console.error(err);}
						console.log("campaign member", ret);
					});
				} else {
					console.log("Campaign member is a dupe! No need to create campaign member");
				}
			})
	};

	var createNewLead = function createNewLead(conn, candidate, campaignId, callback) {
		conn.sobject("Lead").create(candidate, function(err, ret) {
			if (err) {console.error(err); }
			console.log("new lead return values", ret);
			callback(conn, campaignId, ret.id)
		});
	};

	var getCandidate = function getCandidate(conn, candidate, campaignId, callback1, callback2) {
		conn.sobject("Lead")
			.find({
				Email: candidate.Email
			}, "Id, Email, FirstName, LastName")
			.execute( function (err, leads) {
				if(err) {console.error(err)};
				console.log("leads exist?", leads);
				if(leads.length){
					console.log("leads length:", leads.length);
					callback1(conn, campaignId, leads[0].Id);
				} else {
					callback2(conn, candidate, campaignId, callback1);
				}
			});
	};

	getCandidate(conn, candidate, campaignId, createCampaignMember, createNewLead);
});
// console.log("config:", worker.config);
// console.log("task_id:", worker.task_id);
