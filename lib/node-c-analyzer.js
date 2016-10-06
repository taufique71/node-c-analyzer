var parser = require("node-c-parser");
module.exports.parser = parser;

var get_symbol_table = require("./symbol_table").get_symbol_table;
module.exports.get_symbol_table = get_symbol_table;

var get_call_graph = require("./call_graph").get_call_graph;
module.exports.get_call_graph = get_call_graph;
