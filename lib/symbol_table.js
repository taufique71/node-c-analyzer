var _ = require("lodash");

/*
 * This function generates an empty symbol table as JSON object
 * */
var get_scope_list = function(parse_tree){
    var scope_map = {};
    scope_map["global"] = {
        "type": "global",
        "start": {
            "row": null,
            "col": null
        },
        "end": {
            "row": null,
            "col": null
        },
        "contains": {}
    };

    //var is_function_definition = function(subtree){
        //if(subtree.parent.title === "direct_declarator"){
            //if(subtree.parent.parent.title === "declarator"){
                //if(subtree.parent.parent.parent.title === "function_definition"){
                    //return true;
                //}
                //else return false;
            //}
            //else return false;
        //}
        //else return false;
    //};

    //var traverse = function(subtree, scope){
        //if(subtree.tokenClass){
            //if(!scope_map["global"].start.row && !scope_map["global"].start.col){
               //scope_map["global"].start.row = subtree.row;
               //scope_map["global"].start.col = subtree.col;
            //}
            //scope_map["global"].end.row = subtree.row;
            //scope_map["global"].end.col = subtree.col;
        //}

        //if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            //return;
        //}
        //else if((subtree.tokenClass) && (subtree.tokenClass === "IDENTIFIER")){
            //if(is_function_definition(subtree)){
                //scope_map[subtree.lexeme] = {
                    //"start": {
                        //"row": null,
                        //"col": null
                    //},
                    //"end": {
                        //"row": null,
                        //"col": null
                    //},
                    //"contains": [] 
                //};
                //var compound_stmt = subtree.parent.parent.parent.children[2];
                //var o_brace = compound_stmt.children[0];
                //var e_brace = compound_stmt.children[compound_stmt.children.length - 1];
                //scope_map[subtree.lexeme].start.row = o_brace.row;
                //scope_map[subtree.lexeme].start.col = o_brace.col;
                //scope_map[subtree.lexeme].end.row = e_brace.row;
                //scope_map[subtree.lexeme].end.col = e_brace.col;
            //}
            //for(var i = 0; i < subtree.children.length; i++){
                //traverse(subtree.children[i], scope);
            //}
        //}
    //};
    
    /*
     *   Returns name of the function from function definition sub-parsetree
     * */
    var get_function_id_token = function(function_definition){
        var declarator, direct_declarator, func_id_token;
        for(var i = 0 ; i < function_definition.children.length; i++){
            if(function_definition.children[i].title === "declarator"){
                declarator = function_definition.children[i];
                break;
            }
        }
        for(var i = 0 ; i < declarator.children.length; i++){
            if(declarator.children[i].title === "direct_declarator"){
                direct_declarator = declarator.children[i];
                break;
            }
        }
        for(var i = 0 ; i < direct_declarator.children.length; i++){
            if(direct_declarator.children[i].tokenClass && (direct_declarator.children[i].tokenClass === "IDENTIFIER")){
                func_id_token = direct_declarator.children[i];
                break;
            }
        }
        return func_id_token.lexeme;
    };
    
    var traverse = function(subtree, scope){
        if(subtree.tokenClass){
            if(!scope_map["global"].start.row && !scope_map["global"].start.col){
               scope_map["global"].start.row = subtree.row;
               scope_map["global"].start.col = subtree.col;
            }
            scope_map["global"].end.row = subtree.row;
            scope_map["global"].end.col = subtree.col;
        }

        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else if(subtree.title === "function_definition"){
            var function_name = get_function_id_token(subtree);
            var current_scope = scope;
            var new_scope = function_name;
            scope_map[current_scope]["contains"][function_name] = null;

            scope_map[new_scope] = {
                "type": "function",
                "start": {
                    "row": null,
                    "col": null
                },
                "end": {
                    "row": null,
                    "col": null
                },
                "contains": {}
            };

            /* Following section determines the span of newly discovered scope */
            var compound_stmt;
            for(var i = 0 ; i < subtree.children.length; i++){
                if(subtree.children[i].title === "compound_stmt"){
                    compound_stmt = subtree.children[i];
                    break;
                }
            }
            var o_brace = compound_stmt.children[0];
            var e_brace = compound_stmt.children[compound_stmt.children.length - 1];
            scope_map[new_scope].start.row = o_brace.row;
            scope_map[new_scope].start.col = o_brace.col;
            scope_map[new_scope].end.row = e_brace.row;
            scope_map[new_scope].end.col = e_brace.col;

            /* Traverse child subtrees under new scope */
            for(var i = 0; i < subtree.children.length; i++){
                traverse(subtree.children[i], new_scope);
            }
        }
        else if(subtree.title === "declaration"){
            for(var i = 0; i < subtree.children.length; i++){
                traverse(subtree.children[i], scope);
            }
        }
        else{
            for(var i = 0; i < subtree.children.length; i++){
                traverse(subtree.children[i], scope);
            }
        }
    };
    traverse(parse_tree, "global");
    return scope_map;
};

var get_symbol_table = function(parse_tree){
    var add_parent_edges = require("./utility").add_parent_edges;
    add_parent_edges(parse_tree);
    var symbol_table = get_scope_list(parse_tree);
    console.log(symbol_table);
};
module.exports.get_symbol_table = get_symbol_table;
