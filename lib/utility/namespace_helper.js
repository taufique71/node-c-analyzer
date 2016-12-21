var _ = require("lodash");

var populate_namespace_for_labeled_stmt;
var populate_namespace_for_declaration;
var populate_namespace_for_parameter_declaration;
var populate_namespace_for_struct_or_union_specifier;
var populate_namespace_for_enum_specifier;
var populate_namespace;

populate_namespace_for_labeled_stmt = function(subtree, namespace){
    if(subtree.children[0].tokenClass === "IDENTIFIER"){
        var name = {
            "name": subtree.children[0].lexeme,
            "token": _.clone(subtree.children[0]),
            "name_type": "label",
            "name_details": null
        };
        namespace["labels"].push(name);
    }
    else return;
};

populate_namespace_for_parameter_declaration = function(subtree, namespace){
};

populate_namespace_for_function_definition = function(subtree, namespace){
};

populate_namespace_for_struct_or_union_specifier = function(subtree, namespace){
};

populate_namespace_for_enum_specifier = function(subtree, namespace){
};

populate_namespace = function(subtree, namespace){
    switch ( subtree.title ) {
        case "labeled_stmt":
            populate_namespace_for_labeled_stmt(subtree, namespace);
            break;
        case "struct_or_union_specifier":
            populate_namespace_for_struct_or_union_specifier(subtree, namespace);
            break;
        case "enum_specifier":
            populate_namespace_for_enum_specifier(subtree, namespace);
            break;
        case "declaration":
            populate_namespace_for_declaration(subtree, namespace);
            break;
        case "parameter_declaration":
            populate_namespace_for_parameter_declaration(subtree, namespace);
            break;
        case "function_definition":
            populate_namespace_for_function_definition(subtree, namespace);
            break;
    }
};
module.exports.populate_namespace = populate_namespace;
