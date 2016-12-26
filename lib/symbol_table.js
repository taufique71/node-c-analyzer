var _ = require("lodash");
var scope_helper = require("./utility/scope_helper");
var parse_tree_helper = require("./utility/parse_tree_helper");

var get_symbol_table = function(parse_tree){
    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        parse_tree_helper.add_parent_edges(parse_tree);
        var sym_table = scope_helper.populate_scope(parse_tree);
        return sym_table;
    }
};
module.exports.get_symbol_table = get_symbol_table;
