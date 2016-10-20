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

    /* Given a declaration subtree it return true or false 
     * depending on whether the declaration is a variable declaration or function declaration
     * */
    var is_function_declaration = function(declaration){
        var direct_declarator, direct_declarator_p;

        var traverse = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "direct_declarator"){
                    direct_declarator = subtree;
                    return;
                }
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
            }
        };

        traverse(declaration);
        if(direct_declarator.children[0].tokenClass === "(") return true;
        else{
            var direct_declarator_p = direct_declarator.children[1];
            if(direct_declarator_p.children[0].tokenClass === "(") return true;
            else return false;
        }
    };
    
    /*
     * Handles variable declaration to populate symbol table with delcared variable symbols
     * */
    var handle_var_declaration = function(declaration, scope, is_parameter){
        var variable_type = null;
        var get_variable_type = function(declaration_specifiers){
            //console.log(declaration_specifiers);
            var type_specifier = null;
            if(declaration_specifiers.children[0].title === "type_specifier"){
                type_specifier = declaration_specifiers.children[0];
            }
            if(type_specifier){
                if(type_specifier.children[0].lexeme) return type_specifier.children[0].lexeme;
                else return null;
            }
        };
        variable_type = get_variable_type(declaration.children[0]);

        var traverse = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "direct_declarator"){
                    var obj = {};
                    if(is_parameter){
                        obj["is_parameter"] = is_parameter;
                    }
                    obj["identifier_type"] = "variable";
                    obj["variable_type"] = variable_type;
                    scope_map[scope].contains[subtree.children[0].lexeme] = obj;
                    return;
                }
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
            }
        };

        traverse(declaration);
    };

    /*
     * Handles parameter declaration to populate symbol table with delcared parameter symbols
     * */
    var handle_param_declaration = function(param_declaration, scope){
        handle_var_declaration(param_declaration, scope, true);
    };
    
    /*
     * This function traverses the parse tree recursively with custom logic
     * designed just to get necessary symbol table information
     * */
    var traverse = function(subtree, scope){
        
        // As traversing is moving on, range of global scope is being updated
        if(subtree.tokenClass){
            if(!scope_map["global"].start.row && !scope_map["global"].start.col){
               scope_map["global"].start.row = subtree.row;
               scope_map["global"].start.col = subtree.col;
            }
            scope_map["global"].end.row = subtree.row;
            scope_map["global"].end.col = subtree.col;
        }
        
        // If a leaf is reached it is time to return
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        // Else, if a processing subtree is a function definition handle it
        else if(subtree.title === "function_definition"){
            var get_return_type = function(declaration_specifiers){
                var type_specifier = null;
                if(declaration_specifiers.children[0].title === "type_specifier"){
                    type_specifier = declaration_specifiers.children[0];
                }
                if(type_specifier){
                    if(type_specifier.children[0].lexeme) return type_specifier.children[0].lexeme;
                    else return null;
                }
            };

            // New function definition means introduction of new scope
            // So get the name of that scope
            var function_name = get_function_id_token(subtree);
            var function_return_type = null;
            var current_scope = scope;
            var new_scope = function_name;
            var obj = {
                "identifier_type": "function",
            };
            
            if(subtree.children[0].title === "declaration_specifiers"){
                function_return_type = get_return_type(subtree.children[0]);
            }
            else function_return_type = "int";
            obj["return_type"] = function_return_type;

            scope_map[current_scope]["contains"][function_name] = obj;
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
        // Else, if a processing subtree is a declaration handle it
        else if(subtree.title === "declaration"){
            if(is_function_declaration(subtree)){
                return;
            }
            else{
                /* Do all the stuffs here. Like populating symbol table with
                 * information of declared variables, 
                 */
                handle_var_declaration(subtree, scope);
                return;
            }
        }
        // Else, if a processing subtree is a parameter declaration handle it
        else if(subtree.title === "parameter_declaration"){
            handle_param_declaration(subtree, scope);
            return;
        }
        else{
            for(var i = 0; i < subtree.children.length; i++){
                traverse(subtree.children[i], scope);
            }
        }
    };

    /* Start traversing whole parse tree */
    traverse(parse_tree, "global");

    /* Return symbol table*/
    return scope_map;
};

var get_symbol_table = function(parse_tree){
    var add_parent_edges = require("./utility").add_parent_edges;
    add_parent_edges(parse_tree);
    var symbol_table = get_scope_list(parse_tree);
    return symbol_table;
};
module.exports.get_symbol_table = get_symbol_table;
