var _ = require("lodash");
var parse_tree_helper = require("../utility/parse_tree_helper");
var declaration_helper = require("./declaration_helper");



var handle_labeled_stmt;
var handle_variable_declaration;
var handle_typedef_declaration;
var handle_parameter_declaration;
var handle_struct_or_union_specifier;
var handle_enum_specifier;
var handle_function_definition;
var handle_function_declaration;
var handle_record_declaration;
var handle_declaration;
var handle_declaration_specifiers;



handle_declaration = function(declaration, namespace){
    var declaration_specifier_details = declaration_helper.get_details_from_declaration_specifiers(declaration.children[0]);
};
module.exports.handle_declaration = handle_declaration;



handle_labeled_stmt = function(labeled_stmt, namespace){
    if(labeled_stmt.children[0].tokenClass === "IDENTIFIER"){
        var name = {
            "name": labeled_stmt.children[0].lexeme,
            "token": _.clone(labeled_stmt.children[0]),
            "name_type": "label"
        };
        delete name.token.parent;
        namespace["labels"].push(name);
    }
    else return;
};
module.exports.handle_labeled_stmt = handle_labeled_stmt;



/*
 * This function handles namespace population properly for the case of a function
 * declaration.
 */
handle_function_declaration = function(declaration, namespace){
    return;
};
module.exports.handle_function_declaration = handle_function_declaration;



/*
 * This function handles namespace population properly for the case of typedef
 * declaration
 * */
handle_typedef_declaration = function(declaration, namespace){
    var declaration_specifiers = declaration.children[0];
    var init_declarator_list = null;
    /* From grammar it is evident that the declaration subtree can have either two or three children */
    if(declaration.children.length === 2){
        /* If declaration subtree has two children then there is no init_declarator_list*/
    }
    else if(declaration.children.length === 3){
        /* If declaration subtree has three children then certainly the second one is init_declarator_list*/
        init_declarator_list = declaration.children[1];
    }
    var traverse_init_declarator_list = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                /* Each declarator subtree represents a corresponding ondinary id declaration */
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var pointer_expr = "";
                var direct_declarator_p_expr = "";
                if(first_identifier){
                    pointer_expr = parse_tree_helper.get_pointer_expr(subtree);
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "name_type": "typedef",
                        "parameter": false
                    };
                    namespace["ordinary_ids"].push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i]);
                }
            }
        }
    };
};
module.exports.handle_typedef_declaration = handle_typedef_declaration;



handle_record_declaration = function(declaration, namespace){
    var first_type_specifier = parse_tree_helper.get_first_title_matching_subtree();
};
module.exports.handle_record_declaration = handle_record_declaration;



handle_variable_declaration = function(declaration, namespace){
    /*
     * As the declaration is variable declaration from grammar rules it's sure that
     * first child of declaration subtree is declaration_specifiers and second child is 
     * init_declarator_list.
     * */
    var declaration_specifiers = declaration.children[0];
    var init_declarator_list = declaration.children[1];
    var primary_type_expr = parse_tree_helper.construct_type_expr(declaration_specifiers);
    var traverse_init_declarator_list = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var pointer_expr = "";
                var direct_declarator_p_expr = "";
                if(first_identifier){
                    pointer_expr = parse_tree_helper.get_pointer_expr(subtree);
                    var ddp = parse_tree_helper.get_first_title_matching_subtree(subtree, "direct_declarator_p");
                    direct_declarator_p_expr = parse_tree_helper.construct_type_expr(ddp);
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "name_type": "variable",
                        "variable_type": primary_type_expr + pointer_expr + direct_declarator_p_expr,
                        "parameter": false
                    };
                    namespace["ordinary_ids"].push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i]);
                }
            }
        }
    };
    traverse_init_declarator_list(init_declarator_list);
};
module.exports.handle_variable_declaration = handle_variable_declaration;

handle_parameter_declaration = function(parameter_declaration, namespace){
    var declaration_specifiers = parameter_declaration.children[0];
    var declarator = parameter_declaration.children[1];
    var primary_type_expr = parse_tree_helper.construct_type_expr(declaration_specifiers);
    var first_identifier = parse_tree_helper.get_first_token(declarator, "IDENTIFIER");
    var pointer_expr = "";
    var direct_declarator_p_expr = "";
    if(first_identifier){
        pointer_expr = parse_tree_helper.get_pointer_expr(declarator);
        var ddp = parse_tree_helper.get_first_title_matching_subtree(declarator, "direct_declarator_p");
        direct_declarator_p_expr = parse_tree_helper.construct_type_expr(ddp);
        var name = {
            "name": first_identifier.lexeme,
            "token": _.clone(first_identifier),
            "name_type": "variable",
            "variable_type": primary_type_expr + pointer_expr + direct_declarator_p_expr,
            "parameter": true
        };
        namespace["ordinary_ids"].push(name);
        return;
    }
    else return;
};
module.exports.handle_parameter_declaration = handle_parameter_declaration;

handle_function_definition = function(function_definition, namespace){
    var declaration_specifiers = function_definition.children[0];
    var declarator = function_definition.children[1];
    var primary_type_expr = parse_tree_helper.construct_type_expr(declaration_specifiers);
    var first_identifier = parse_tree_helper.get_first_token(declarator, "IDENTIFIER");
    var pointer_expr = "";
    var direct_declarator_p_expr = "";
    if(first_identifier){
        var function_type = "regular";
        var first_token = parse_tree_helper.get_first_token(declaration_specifiers, null);
        if(first_token.tokenClass === "INLINE") function_type = "inline";
        pointer_expr = parse_tree_helper.get_pointer_expr(declarator);
        //var ddp = parse_tree_helper.get_first_title_matching_subtree(declarator, "direct_declarator_p");
        //direct_declarator_p_expr = parse_tree_helper.construct_type_expr(ddp);
        var name = {
            "name": first_identifier.lexeme,
            "token": _.clone(first_identifier),
            "name_type": "function",
            "function_return_type": primary_type_expr + pointer_expr,
            "function_type": function_type
        };
        namespace["ordinary_ids"].push(name);
        return;
    }
    else return;
};
module.exports.handle_function_definition = handle_function_definition;

var populate_struct_or_union_members = function(struct_declarator_list, tag, primary_type_expr){
    var traverse = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var pointer_expr = "";
                var direct_declarator_p_expr = "";
                if(first_identifier){
                    pointer_expr = parse_tree_helper.get_pointer_expr(subtree);
                    var ddp = parse_tree_helper.get_first_title_matching_subtree(subtree, "direct_declarator_p");
                    direct_declarator_p_expr = parse_tree_helper.construct_type_expr(ddp);
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "name_type": "member",
                        "member_type": primary_type_expr + pointer_expr + direct_declarator_p_expr
                    };
                    tag["members"].push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i]);
                }
            }
        }
    };
    traverse(struct_declarator_list);
};


handle_struct_or_union_specifier = function(struct_or_union_specifier, namespace){
    if(struct_or_union_specifier.children.length === 2) return;
    else if(struct_or_union_specifier.children[1].tokenClass === "{") return;
    else{
        var first_token = parse_tree_helper.get_first_token(struct_or_union_specifier, null);
        var first_identifier = parse_tree_helper.get_first_token(struct_or_union_specifier, "IDENTIFIER");
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
        namespace["tags"].push(name);
    }
};
module.exports.handle_struct_or_union_specifier = handle_struct_or_union_specifier;

var populate_enumerators = function(enumerator_list, namespace){
    var traverse = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "enumerator"){
                var name = {
                    "name": subtree.children[0].lexeme,
                    "token": _.clone(subtree.children[0]),
                    "name_type": "enumerator",
                };
                namespace["ordinary_ids"].push(name);
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i]);
                }
            }
        }
    };
    traverse(enumerator_list);
};

handle_enum_specifier = function(enum_specifier, namespace){
    if(enum_specifier.children.length === 2) return;
    else if(enum_specifier.children[1].tokenClass === "{") return;
    else{
        var first_token = parse_tree_helper.get_first_token(enum_specifier, null);
        var first_identifier = parse_tree_helper.get_first_token(enum_specifier, "IDENTIFIER");
        var name = {
            "name": first_identifier.lexeme,
            "token": _.clone(first_identifier),
            "name_type": first_token.lexeme,
        };

        var traverse = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "enumerator_list"){
                    populate_enumerators(subtree, namespace);
                }
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
            }
        };
        traverse(enum_specifier);
        namespace["tags"].push(name);
    }
};
module.exports.handle_enum_specifier = handle_enum_specifier;
