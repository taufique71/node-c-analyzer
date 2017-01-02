var parser = require("node-c-parser");
module.exports.parser = parser;

var symbol_table_analyzer = require("./symbol_table/symbol_table");
module.exports.symbol_table_analyzer = symbol_table_analyzer;

var call_graph_analyzer = require("./call_graph/call_graph");
module.exports.call_graph_analyzer = call_graph_analyzer;
