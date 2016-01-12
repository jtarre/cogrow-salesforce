var worker  = require('node_helper');
var jsforce = require('jsforce');
var _  = require('lodash');

console.log("config:", worker.config);
console.log("params:", worker.params);
console.log("task_id:", worker.task_id);

var campaignId = worker.params.campaignId;

var availableSfData = [
	{sf: "FirstName", params: "first"},
	{sf: "LastName", params: "last"},
	{sf: "Email", params: "email"},
	{sf: 'Major__c', params: 'major'},
	{sf: 'Graduation_Year__c', params: 'gradYear'},
	{sf: 'Company', params: 'school'}
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
candidate = createCandidateObj(candidate, availableSfData, worker.params);
console.log("candidate object", candidate);

var conn = new jsforce.Connection({
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
		conn.sobject("CampaignMember")
			.find({
				Id: campaignId,
				LeadId: candidateId
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
					console.log("campaign members info: ", campaignMembers);
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
					console.log("list of leads:")
					callback1(conn, campaignId, leads[0].Id);
				} else {
					callback2(conn, candidate, campaignId, callback1);
				}
			});
	};

	getCandidate(conn, candidate, campaignId, createCampaignMember, createNewLead);
});

