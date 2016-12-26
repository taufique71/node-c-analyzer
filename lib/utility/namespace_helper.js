var _ = require("lodash");
var parse_tree_helper = require("./parse_tree_helper");

var populate_namespace_for_labeled_stmt;
var populate_namespace_for_variable_declaration;
var populate_namespace_for_parameter_declaration;
var populate_namespace_for_struct_or_union_specifier;
var populate_namespace_for_enum_specifier;
var populate_namespace_for_init_declarator_list;

populate_namespace_for_labeled_stmt = function(labeled_stmt, namespace){
    if(labeled_stmt.children[0].tokenClass === "IDENTIFIER"){
        var name = {
            "name": labeled_stmt.children[0].lexeme,
            "token": _.clone(labeled_stmt.children[0]),
            "name_type": "label"
        };
        namespace["labels"].push(name);
    }
    else return;
};
module.exports.populate_namespace_for_labeled_stmt = populate_namespace_for_labeled_stmt;

populate_namespace_for_init_declarator_list = function(init_declarator_list, namespace, primary_type_expr){
    var traverse_init_declarator_list = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var pointer_expr = "";
                var info_from_direct_declarator = null;
                if(subtree.children.length == 2){
                    // This means pointer expression is prevalent within the declarator subtree
                    pointer_expr = parse_tree_helper.get_pointer_expr(subtree.children[0]);
                    info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[1]);
                }
                else{
                    info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[0]);
                }
                var name = {
                    "name": info_from_direct_declarator.id.lexeme,
                    "token": _.clone(info_from_direct_declarator.id),
                    "name_type": "variable",
                    "variable_type": primary_type_expr + pointer_expr + info_from_direct_declarator.direct_declarator_p_expr
                };
                namespace["ordinary_ids"].push(name);
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i]);
                }
            }
        }
    };
};

populate_namespace_for_variable_declaration = function(declaration, namespace){
    var declaration_specifiers = declaration.children[0];
    var init_declarator_list = declaration.children[1];
    var primary_type_expr = parse_tree_helper.get_primary_type(declaration_specifiers);
    populate_namespace_for_init_declarator_list(init_declarator_list, namespace, primary_type_expr);
};
module.exports.populate_namespace_for_variable_declartion = populate_namespace_for_variable_declartion;

populate_namespace_for_parameter_declaration = function(subtree, namespace){
};
module.exports.populate_namespace_for_parameter_declaration = populate_namespace_for_parameter_declaration;

populate_namespace_for_function_definition = function(subtree, namespace){
};
module.exports.populate_namespace_for_function_definition = populate_namespace_for_function_definition;

populate_namespace_for_struct_or_union_specifier = function(subtree, namespace){
};
module.exports.populate_namespace_for_struct_or_union_specifier = populate_namespace_for_struct_or_union_specifier;

populate_namespace_for_enum_specifier = function(subtree, namespace){
};
module.exports.populate_namespace_for_enum_specifier = populate_namespace_for_enum_specifier;
