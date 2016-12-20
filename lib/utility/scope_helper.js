var detect_scope = function(subtree){
    if( subtree.title === "translation_unit" ) return "global_scope";
    else if( subtree.title === "iteration_stmt" ) return "block_scope";
    else if( subtree.title === "selection_stmt" ) return "block_scope";
    else if( subtree.title === "compound_stmt" ) return "block_scope";
    else if( subtree.title === "function_definition") return "function_scope";
    else return null;
};
module.exports.detect_scope = detect_scope;

var traverse = function(subtree, scope_type, scopes, namespace){
    if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
        return;
    }
    else{
        var populate_namespace = require("./namespace_helper").populate_namespace;
        switch ( subtree.title ) {
            case "translation_unit":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
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
                break;
            case "compound_stmt":
                var scope_obj = populate_scope(subtree);
                scopes.push(scope_obj);
                break;
            case "declaration":
                break;
            case "parameter_list":
                break;
            case "struct_or_union_specifier":
                break;
            case "enum_specifier":
                break;
            case "labeled_stmt":
                break;
            default:
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i], range, scope_type, scopes, namespace );
                }
                break;
        }
    }
};

var populate_scope = function(subtree){
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

    traverse(subtree, scopes, namespace);

    var scope_obj = {
        "scope_type": scope_type,
        "range": range,
        "scopes": scopes,
        "namespace": namespace
    };

    return scope_obj;
};
module.exports.populate_scope = populate_scope;

var populate_global_scope = function(subtree){
    var range = {
        "start": { "row": null, "col": null },
        "end": { "row": null, "col": null }
    };
    var scope_type = "global_scope";
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
    
    var process_translation_unit = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "translation_unit") traverse(subtree, scopes, namespace);
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    process_translation_unit(subtree.children[i]);
                }
            }
            return;
        }
    }
    process_translation_unit(subtree);

    var scope_obj = {
        "scope_type": scope_type,
        "range": range,
        "scopes": scopes,
        "namespace": namespace
    };

    return scope_obj;
};
module.exports.populate_global_scope = populate_global_scope;
