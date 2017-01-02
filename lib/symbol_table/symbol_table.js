var _ = require("lodash");
var scope_helper = require("./scope_helper");

var get_symbol_table = function(parse_tree){
    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        var sym_table = scope_helper.populate_scope(parse_tree);
        return sym_table;
    }
};
module.exports.get_symbol_table = get_symbol_table;

var get_scope_list = function(sym_table){
    var scope_list = {};
    var scope_type_count = {};
    var traverse = function(scope, parent){
        if(scope_type_count[scope.scope_type]) scope_type_count[scope.scope_type]++;
        else scope_type_count[scope.scope_type] = 0;

        var scope_name = scope.scope_type+scope_type_count[scope.scope_type];

        if(parent) scope_name =  parent + "/" + scope_name;

        scope_list[scope_name] = _.clone(scope);
        delete scope_list[scope_name].scopes;
    };
    traverse(sym_table, null);
    return scope_list;
};
module.exports.get_scope_list = get_scope_list;
