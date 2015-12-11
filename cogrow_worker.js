var worker = require('node_helper');
var campaignId;
// console.log("Hello world from Node.js");
console.log("params:", worker.params);

campaignId = worker.params.campaignId;
console.log("Please be so kind and tell me the campaign id:", campaignId);
console.log("config:", worker.config);
console.log("task_id:", worker.task_id);
