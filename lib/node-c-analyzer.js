var parser = require("node-c-parser");
module.exports.parser = parser;

var variable_count = require("./variable_count").variable_count;
module.exports.variable_count = variable_count;

var function_definition_count = require("./function_definition_count").function_definition_count;
module.exports.function_definition_count = function_definition_count;
