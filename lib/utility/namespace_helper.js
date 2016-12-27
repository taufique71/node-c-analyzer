var _ = require("lodash");
var parse_tree_helper = require("./parse_tree_helper");

var populate_namespace_for_labeled_stmt;
var populate_namespace_for_variable_declaration;
var populate_namespace_for_parameter_declaration;
var populate_namespace_for_struct_or_union_specifier;
var populate_namespace_for_enum_specifier;
var populate_namespace_for_init_declarator_list;
var populate_namespace_for_function_definition;
var populate_struct_or_union_members;

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
                    "variable_type": primary_type_expr + pointer_expr + info_from_direct_declarator.direct_declarator_p_expr,
                    "parameter": false
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

populate_namespace_for_parameter_declaration = function(parameter_declaration, namespace){
    var declaration_specifiers = parameter_declaration.children[0];
    var declarator = parameter_declaration.children[1];
    var primary_type_expr = parse_tree_helper.get_primary_type(declaration_specifiers);
    var pointer_expr = "";
    var info_from_direct_declarator = null;
    if(declarator.children.length == 2){
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
        "variable_type": primary_type_expr + pointer_expr + info_from_direct_declarator.direct_declarator_p_expr,
        "parameter": true
    };
    namespace["ordinary_ids"].push(name);
};
module.exports.populate_namespace_for_parameter_declaration = populate_namespace_for_parameter_declaration;

populate_namespace_for_function_definition = function(function_definition, namespace){
    var declaration_specifiers = function_definition.children[0];
    var declarator = function_definition.children[1];
    var primary_type_expr = parse_tree_helper.get_primary_type(declaration_specifiers);
    var pointer_expr = "";
    var info_from_direct_declarator = null;
    if(declarator.children.length == 2){
        pointer_expr = parse_tree_helper.get_pointer_expr(subtree.children[0]);
        info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[1]);
    }
    else{
        info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[0]);
    }
    var function_type = "regular";
    var first_token = get_first_token(declaration_specifiers);
    if(first_token.tokenClass === "INLINE") function_type = "inline";
    var name = {
        "name": info_from_direct_declarator.id.lexeme,
        "token": _.clone(info_from_direct_declarator.id),
        "name_type": "function",
        "function_return_type": primary_type_expr + pointer_expr + info_from_direct_declarator.direct_declarator_p_expr,
        "function_type": function_type
    };
    namespace["ordinary_ids"].push(name);
};
module.exports.populate_namespace_for_function_definition = populate_namespace_for_function_definition;

populate_struct_or_union_members = function(struct_declarator_list, tag, primary_type_expr){
    var traverse = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var pointer_expr = "";
                var info_from_direct_declarator = null;
                if(subtree.children.length == 2){
                    pointer_expr = parse_tree_helper.get_pointer_expr(subtree.children[0]);
                    info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[1]);
                }
                else{
                    info_from_direct_declarator = parse_tree_helper.get_info_from_direct_declarator(subtree.children[0]);
                }
                var name = {
                    "name": info_from_direct_declarator.id.lexeme,
                    "token": _.clone(info_from_direct_declarator.id),
                    "name_type": "member",
                    "member_type": primary_type_expr + pointer_expr + info_from_direct_declarator.direct_declarator_p_expr
                };
                tag["members"].push(name);
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i]);
                }
            }
        }
    };
    traverse(struct_declarator_list);
};

populate_namespace_for_struct_or_union_specifier = function(struct_or_union_specifier, namespace){
    if(struct_or_union_specifier.children.length === 2) return;
    else if(struct_or_union_specifier.children[1].tokenClass === "{") return;
    else{
        var first_token = parse_tree_helper.get_first_token(struct_or_union_specifier);
        var first_identifier = parse_tree_helper.get_first_identifier(struct_or_union_specifier);
        var name = {
            "name": first_identifier.lexeme,
            "token": _.clone(first_identifier),
            "name_type": first_token.lexeme,
            "members": []
        };

        var traverse = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "struct_declaration"){
                    var specifier_qualifier_list = subtree.children[0];
                    var struct_declarator_list = subtree.children[1];
                    var primary_type_expr = parse_tree_helper.construct_type_expr(specifier_qualifier_list);
                    populate_struct_or_union_members(struct_declarator_list, name, primary_type_expr);
                }
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
            }
        };
        traverse(struct_or_union_specifier);
    }
};
module.exports.populate_namespace_for_struct_or_union_specifier = populate_namespace_for_struct_or_union_specifier;

populate_namespace_for_enum_specifier = function(subtree, namespace){
};
module.exports.populate_namespace_for_enum_specifier = populate_namespace_for_enum_specifier;
