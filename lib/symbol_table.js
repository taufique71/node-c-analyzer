var _ = require("lodash");

var get_symbol_table = function(parse_tree){
    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        var add_parent_edges = require("./utility/parse_tree_helper").add_parent_edges;
        add_parent_edges(parse_tree);
        var populate_scope = require("./utility/scope_helper").populate_scope;
        var sym_table = populate_scope(parse_tree);
        return sym_table;
    }
};
module.exports.get_symbol_table = get_symbol_table;
