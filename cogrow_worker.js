var worker = require('node_helper');

console.log("Hello world from Node.js");
console.log("params:", worker.params);
console.log("config:", worker.config);
console.log("task_id:", worker.task_id);
