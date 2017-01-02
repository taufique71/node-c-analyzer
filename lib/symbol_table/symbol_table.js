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

        for(var i = 0; i < scope.scopes.length; i++) traverse(scope.scopes[i], scope_name);
    };
    traverse(sym_table, null);
    return scope_list;
};
module.exports.get_scope_list = get_scope_list;

var get_function_list = function(sym_table){
    // Returns true of false depending on whether querying location is enclosed
    // inside enclosing location.
    // query_loc = { row: 1, col: 2}
    // enclosing_loc = {
    //     start: {row: 0, col: 0},
    //     end: {row: 10, col: 10}
    // }
    var is_enclosed_inside = function(query_loc, enclosing_loc){
        if(query_loc.row > enclosing_loc.start.row){
            if(query_loc.row < enclosing_loc.end.row) return true;
            else if(query_loc.row > enclosing_loc.end.row) return false;
            else{
                if(query_loc.col < enclosing_loc.end.col) return true;
                else if(query_loc.col > enclosing_loc.end.col) return false;
            }
        }
        else if(query_loc.row < enclosing_loc.start.row) return false;
        else{
            if(query_loc.col > enclosing_loc.start.col) return true;
            else if(query_loc.col < enclosing_loc.start.col) return false;
        }
    };

    var function_names = _.filter(sym_table.namespace.ordinary_ids, {"name_type": "function"});
    var function_scopes = _.filter(sym_table.scopes, {"scope_type": "function_scope"});
    var function_list = [];
    for( var i = 0; i < function_names.length; i++){
        var function_name = _clone(function_names[i]);
        //function_list.push(_.clone(function_names[i]));
        for(var j = 0; j < function_scopes.length; j++){
            var name_location = {
                "row": function_names[i].token.row;
                "col": function_names[i].token.col;
            };
            if(is_enclosed_inside(name_location, function_scopes[j].range)){
                function_name["parameters"] = _.filter(function_scopes[j].namespace.ordinary_ids,
                                                        {"name_type": "function", "parameter": true});
                function_name["range"] = _.clone(function_scope[j].range);
                break;
            }
        }
        function_list.push(function_name);
    }
    return function_list;
};
module.exports.get_function_list = get_function_list;
