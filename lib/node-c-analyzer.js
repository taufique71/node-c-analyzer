var parser = require("node-c-parser");
module.exports.parser = parser;

var get_symbol_table = require("./symbol_table").get_symbol_table;
module.exports.get_symbol_table = get_symbol_table;
