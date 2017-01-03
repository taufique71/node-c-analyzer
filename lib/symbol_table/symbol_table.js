var _ = require("lodash");
var scope_helper = require("./scope_helper");
var utils = require("../utility/utils");

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

        for(var i = 0; i < scope.scopes.length; i++) traverse(scope.scopes[i], scope_name);
    };
    traverse(sym_table, null);
    return scope_list;
};
module.exports.get_scope_list = get_scope_list;

var get_function_list = function(sym_table){
    var function_list = _.filter(sym_table.namespace.ordinary_ids, {"name_type": "function"});
    var function_scope_list = _.filter(sym_table.scopes, {"scope_type": "function_scope"});
    for( var i = 0; i < function_list.length; i++){
        for(var j = 0; j < function_scope_list.length; j++){
            var declaration_location = {
                "row": function_list[i].token.row,
                "col": function_list[i].token.col
            };
            if(utils.is_enclosed_inside(declaration_location, function_scopes[j].range)){
                function_list[i]["parameters"] = _.filter(function_scopes[j].namespace.ordinary_ids,
                                                        {"name_type": "function", "parameter": true});
                function_name[i]["range"] = _.clone(function_scope[j].range);
                break;
            }
        }
    }
    return function_list;
};
module.exports.get_function_list = get_function_list;
