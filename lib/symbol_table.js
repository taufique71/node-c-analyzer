var get_identifier_list = function(parse_tree){
    var identifier_list = [];
    var traverse = function(subtree){
        if((subtree.tokenClass) && (subtree.tokenClass === "IDENTIFIER")){
            identifier_list.push(
                {
                    "lexeme": subtree.lexeme,
                    "row": subtree.row,
                    "col": subtree.col
                }
            );
        }
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        for(var i = 0; i < subtree.children.length; i++){
            traverse(subtree.children[i]);
        }
    };
    traverse(parse_tree);
    return identifier_list;
};

var is_function = function(subtree){
    if(subtree.parent.title === "direct_declarator"){
        if(subtree.parent.parent.title === "declarator"){
            if(subtree.parent.parent.parent.title === "function_definition"){
                return true;
            }
            else return false;
        }
        else return false;
    }
    else return false;
};

var get_scope_list = function(parse_tree){
    var scope_map = {};
    scope_map["global"] = {
        "start": {
            "row": null,
            "col": null
        },
        "end": {
            "row": null,
            "col": null
        },
        "contains": []
    };


    var traverse = function(subtree){
        if((subtree.tokenClass) && (subtree.tokenClass === "IDENTIFIER")){
            if(is_function(subtree)){
                scope_map[subtree.lexeme] = {
                    "start": {
                        "row": null,
                        "col": null
                    },
                    "end": {
                        "row": null,
                        "col": null
                    },
                    "contains": []
                };
            }
        }
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        for(var i = 0; i < subtree.children.length; i++){
            traverse(subtree.children[i]);
        }
    };
    traverse(parse_tree);
    return scope_map;
};

var symbol_table = function(parse_tree){
    var add_parent_edges = require("./utility").add_parent_edges;
    add_parent_edges(parse_tree);
    var identifier_list = get_identifier_list(parse_tree);
    console.log(get_scope_list(parse_tree));
};
module.exports.symbol_table = symbol_table;
