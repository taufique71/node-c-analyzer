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
    var scope_name_type_count = {};
    var traverse = function(scope, parent){
        var final_scope_name = scope.scope_name + "__" + scope.scope_type;
        if(scope.scope_type === "block_scope"){
            if(scope_name_type_count[final_scope_name]) final_scope_name = final_scope_name + "__" + scope_name_type_count[final_scope_name]++;
            else{
                scope_name_type_count[final_scope_name] = 1;
                final_scope_name = final_scope_name + "__" + scope_name_type_count[final_scope_name]++;
            }
        }
        if(parent) final_scope_name =  parent + "/" + final_scope_name;

        scope_list[final_scope_name] = _.clone(scope);
        for(var i = 0; i < scope.scopes.length; i++) traverse(scope.scopes[i], final_scope_name);
        delete scope_list[final_scope_name].scopes;
    };
    traverse(sym_table, null);
    return scope_list;
};
module.exports.get_scope_list = get_scope_list;

var get_function_list = function(sym_table){
    var function_list = _.filter(sym_table.namespace.ordinary_ids, {"name_type": "function"});
    var function_scope_list = _.filter(sym_table.scopes, {"scope_type": "function_scope"});
    for( var i = 0; i < function_list.length; i++){
        function_list[i]["declaration_location"] = {
            "row": function_list[i].token.row,
            "col": function_list[i].token.col
        };
        delete function_list[i].token;
        for(var j = 0; j < function_scope_list.length; j++){
            if(utils.is_enclosed_inside(function_list[i].declaration_location, function_scope_list[j].range)){
                function_list[i]["parameters"] = _.filter(function_scope_list[j].namespace.ordinary_ids,
                                                        {"name_type": "variable", "parameter": true});
                function_list[i]["range"] = _.clone(function_scope_list[j].range);
                break;
            }
        }
    }
    return function_list;
};
module.exports.get_function_list = get_function_list;
