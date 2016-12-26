var detect_scope;
var traverse;
var populate_scope;
var _ = require("lodash");

detect_scope = function(subtree){
    if( subtree.title === "translation_unit" ) return "global_scope";
    else if( subtree.title === "iteration_stmt" ) return "block_scope";
    else if( subtree.title === "selection_stmt" ) return "block_scope";
    else if( subtree.title === "compound_stmt" ) return "block_scope";
    else if( subtree.title === "function_definition") return "function_scope";
    else return null;
};
module.exports.detect_scope = detect_scope;


traverse = function(subtree, scopes, namespace){
    if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
        return;
    }
    else{
        var populate_namespace = require("./namespace_helper").populate_namespace;
        switch ( subtree.title ) {
            case "iteration_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "selection_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "function_definition":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                populate_namespace(subtree, namespace);
                break;
            case "compound_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "declaration":
                populate_namespace(subtree, namespace);
                break;
            case "parameter_list":
                populate_namespace(subtree, namespace);
                break;
            case "struct_or_union_specifier":
                populate_namespace(subtree, namespace);
                break;
            case "enum_specifier":
                populate_namespace(subtree, namespace);
                break;
            case "labeled_stmt":
                populate_namespace(subtree, namespace);
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
    var scopes = [];
    var namespace = {
        "labels": [],
        "tags": [],
        "ordinary_ids": []
    };

    var get_first_token = require("./parse_tree_helper").get_first_token;
    var get_last_token = require("./parse_tree_helper").get_last_token;

    // Determining the range of the scope, which is the position within very first and very last token
    var first_tok = get_first_token(subtree);
    var last_tok = get_last_token(subtree);
    range.start.row = first_tok.row;
    range.start.col = first_tok.col;
    range.end.row = last_tok.row;
    range.end.col = last_tok.col;

    if(subtree.title === "translation_unit"){
        // Custom logic for populating scope for trabslation_unit
        var traverse_translation_unit = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "external_declaration") traverse(subtree, scopes, namespace);
                else{
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
        // Custom logic for populating scope for iteration_stmt
        var traverse_iteration_stmt = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "declaration") traverse(subtree, scopes, namespace);
                else if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
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
        // Custom logic for populating scope for selection_stmt
        var traverse_selection_stmt = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "block_item_list") traverse(subtree, scopes, namespace);
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
    else if(subtree.title === "compund_stmt"){
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
        // Custom logic for populating scope for function_definition
        var traverse_function_definition = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "parameter_list") traverse(subtree, scopes, namespace);
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
        "range": range,
        "scopes": scopes,
        "namespace": namespace
    };

    return scope_obj;
};
module.exports.populate_scope = populate_scope;
