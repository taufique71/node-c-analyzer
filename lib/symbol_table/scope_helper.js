var _ = require("lodash");
var namespace_helper = require("./namespace_helper");
var parse_tree_helper = require("../utility/parse_tree_helper");

var detect_scope;
var traverse;
var populate_scope;

detect_scope = function(subtree){
    if( subtree.title === "translation_unit" ) return "file_scope";
    else if( subtree.title === "iteration_stmt" ) return "block_scope";
    else if( subtree.title === "selection_stmt" ) return "block_scope";
    else if( subtree.title === "compound_stmt" ) return "block_scope";
    else if( subtree.title === "function_definition") return "function_scope";
    else return null;
};

traverse = function(subtree, scopes, namespace){
    if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
        return;
    }
    else{
        switch ( subtree.title ) {
            case "iteration_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "selection_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "compound_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "declaration":
                if(parse_tree_helper.is_struct_union_or_enum_declaration(subtree)){
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i], scopes, namespace);
                    }
                }
                else{
                    if(!parse_tree_helper.is_function_declaration(subtree)){
                        if(parse_tree_helper.is_typedef_declaration(subtree)) namespace_helper.handle_typedef_declaration(subtree, namespace);
                        else namespace_helper.handle_variable_declaration(subtree, namespace);
                        for(var i = 0; i < subtree.children.length; i++){
                            traverse(subtree.children[i], scopes, namespace);
                        }
                    }
                }
                break;
            case "parameter_declaration":
                namespace_helper.handle_parameter_declaration(subtree, namespace);
                break;
            case "function_definition":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                namespace_helper.handle_function_definition(subtree, namespace);
                break;
            case "struct_or_union_specifier":
                namespace_helper.handle_struct_or_union_specifier(subtree, namespace);
                break;
            case "enum_specifier":
                namespace_helper.handle_enum_specifier(subtree, namespace);
                break;
            case "labeled_stmt":
                namespace_helper.handle_labeled_stmt(subtree, namespace);
                break;
            default:
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i], scopes, namespace);
                }
                break;
        }
    }
};

populate_scope = function(subtree){
    var range = {
        "start": { "row": null, "col": null },
        "end": { "row": null, "col": null }
    };
    var scope_type = detect_scope(subtree);
    var scope_name = null;
    var scopes = [];
    var namespace = {
        "labels": [],
        "tags": [],
        "ordinary_ids": []
    };

    // Determining the range of the scope, which is the space within very first and very last token
    var first_tok = parse_tree_helper.get_first_token(subtree, null);
    var last_tok = parse_tree_helper.get_last_token(subtree, null);
    range.start.row = first_tok.row;
    range.start.col = first_tok.col;
    range.end.row = last_tok.row;
    range.end.col = last_tok.col;

    if(subtree.title === "translation_unit"){
        scope_name = "global";
        // Custom logic for populating scope information for translation_unit rules
        var traverse_translation_unit = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                /*
                 * As a translation_unit is a list of external declarations,
                 * find each external_declaration rule and send it to generic logic where decisions
                 * are made for further actions
                 * */
                if(subtree.title === "external_declaration") traverse(subtree, scopes, namespace);
                else{
                    /*
                     * If external_declaration rule is not found then keep traversing until
                     * end of traversal to find one.
                     * */
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse_translation_unit(subtree.children[i]);
                    }
                }
                return;
            }
        }
        traverse_translation_unit(subtree);
    }
    else if(subtree.title === "iteration_stmt"){
        var first_token = parse_tree_helper.get_first_token(subtree, null);
        scope_name = first_token.lexeme;
        // Custom logic for populating scope for iteration_stmt
        var traverse_iteration_stmt = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                /*
                 * Iteration statement can be a for statement. In that case there might be some kind of
                 * variable declaration which needs to be handled separately like other declarations.
                 * So if a declaration rule is found then pass it to the generic logic for further decision
                 * making. Except that look for a block statement and handle like other block statements.
                 * */
                if(subtree.title === "declaration") traverse(subtree, scopes, namespace);
                else if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
                else if(subtree.title === "stmt") traverse(subtree, scopes, namespace);
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse_iteration_stmt(subtree.children[i]);
                    }
                }
                return;
            }
        }
        traverse_iteration_stmt(subtree);
    }
    else if(subtree.title === "selection_stmt"){
        var first_token = parse_tree_helper.get_first_token(subtree, null);
        scope_name = first_token.lexeme;
        // Custom logic for populating scope for selection_stmt
        var traverse_selection_stmt = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
                else if(subtree.title === "stmt") traverse(subtree, scopes, namespace);
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse_selection_stmt(subtree.children[i]);
                    }
                }
                return;
            }
        }
        traverse_selection_stmt(subtree);
    }
    else if(subtree.title === "compound_stmt"){
        scope_name = "simple_block";
        // Custom logic for populating scope for compound_stmt
        var traverse_compound_stmt = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse_compound_stmt(subtree.children[i]);
                    }
                }
                return;
            }
        }
        traverse_compound_stmt(subtree);
    }
    else if(subtree.title === "function_definition"){
        var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
        scope_name = first_identifier.lexeme;
        // Custom logic for populating scope for function_definition
        var traverse_function_definition = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "parameter_declaration") traverse(subtree, scopes, namespace);
                else if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse_function_definition(subtree.children[i]);
                    }
                }
                return;
            }
        }
        traverse_function_definition(subtree);
    }

    var scope_obj = {
        "scope_type": scope_type,
        "scope_name": scope_name,
        "range": range,
        "scopes": scopes,
        "namespace": namespace
    };

    return scope_obj;
};
module.exports.populate_scope = populate_scope;
