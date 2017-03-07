var _ = require("lodash");
var parse_tree_helper = require("../utility/parse_tree_helper");
var statement_helper = require("../statements/statement_helper");
var declarator_helper = require("./declarator_helper");

var handle_labeled_stmt;
var handle_parameter_declaration;
var handle_function_definition;
var get_specifiers_qualifiers;
var get_type_qualifiers;
var get_storage_class_specifiers;
var get_type_specifiers;
var get_info_from_type_specifier;
var get_details_from_struct_or_union_specifier;
var get_members_from_struct_declaration_list;
var get_members_from_struct_declaration;
var get_details_from_enum_specifier;

handle_labeled_stmt = function(labeled_stmt, namespace){
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
module.exports.handle_labeled_stmt = handle_labeled_stmt;


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


handle_declaration = function(declaration, namespace){
    var traverse_init_declarator_list = function(subtree, specifiers_qualifiers){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var phrased_declarator = declarator_helper.get_phrasing_from_declarator(subtree);
                if(first_identifier && phrased_declarator){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers);
                        "parameter": false
                    };
                    namespace["ordinary_ids"].push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i], specifiers_qualifiers);
                }
            }
        }
    };
    if(declaration.children[0].title === "declaration_specifiers"){
        if(declaration.children.length === 3){
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0]);
            traverse_init_declarator_list(declaration.children[1], specifiers_qualifiers);
        }
        else if(declaration.children.length === 2){
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0]);
        }
    }
    else if(declaration.children[0].title === "type_name"){
        if(declaration.children.length === 3){
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0]);
            traverse_init_declarator_list(declaration.children[1], specifiers_qualifiers);
        }
    }
};
module.exports.handle_declaration = handle_declaration;


get_specifiers_qualifiers = function(specifiers_qualifiers, namespace){
    var type_qualifiers = get_type_qualifiers(specifiers_qualifiers, namespace);
    var storage_class_specifiers = get_storage_class_specifiers(specifiers_qualifiers, namespace);
    var type_specifiers = get_type_specifiers(specifiers_qualifiers, namespace);
    var obj = {
        "type_qualifiers": type_qualifiers,
        "storage_class_specifiers": storage_class_specifiers,
        "type_specifiers": type_specifiers
    };
    return obj;
};


get_type_qualifiers = function(specifiers_qualifiers, namespace){
    var type_qualifiers = [];
    var traverse = function(subtree){
        if( subtree.title === "type_qualifier" ){
            type_qualifiers.push(subtree.children[0]);
            return;
        }
        else{
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)) return;
            else{
                for(var i = 0 ; i < subtree.children.length; i++) traverse(subtree.children[i]);
                return;
            }
        }
    };
    traverse(specifiers_qualifiers);
    return type_qualifiers;
};


get_storage_class_specifiers = function(specifiers_qualifiers, namespace){
    var storage_class_specifiers = [];
    var traverse = function(subtree){
        if( subtree.title === "storage_class_specifier"){
            storage_class_specifiers.push(subtree.children[0]);
            return;
        }
        else{
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)) return;
            else{
                for(var i = 0 ; i < subtree.children.length; i++) traverse(subtree.children[i]);
                return;
            }
        }
    };
    traverse(specifiers_qualifiers);
    return storage_class_specifiers;
};


get_type_specifiers = function(specifiers_qualifiers, namespace){
    var type_specifiers = [];
    var traverse = function(subtree){
        if( (subtree.title === "type_specifier") || (subtree.title === "type_name") ){
            var ts = get_info_from_type_specifier(subtree, namespace);
            type_specifiers.push(ts);
            return;
        }
        else{
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)) return;
            else{
                for(var i = 0 ; i < subtree.children.length; i++) traverse(subtree.children[i]);
                return;
            }
        }
    };
    traverse(specifiers_qualifiers);
    return type_specifiers;
};


get_info_from_type_specifier = function(type_specifier, namespace){
    /*
     *  type_specifier -> VOID
     *                  | CHAR
     *                  | SHORT
     *                  | INT
     *                  | LONG
     *                  | FLOAT
     *                  | DOUBLE
     *                  | SIGNED
     *                  | UNSIGNED
     *                  | BOOL
     *                  | COMPLEX
     *                  | IMAGINARY
     *                  | struct_or_union_specifier
     *                  | enum_specifier
     *
     * */
    if(type_specifier.title === "type_specifier"){
        var obj = {};
        var first_token = parse_tree_helper.get_first_token(type_specifier);
        obj["type"] = first_token.lexeme;
        if((obj.type === "struct") || (obj.type === "union")){
            obj["primitive"] = false;
            var details = get_details_from_struct_or_union_specifier(type_specifier, namespace);
            obj["details"] = details;
        }
        else if(obj.type === "enum"){
            obj["primitive"] = false;
            var details = get_details_from_enum_specifier(type_specifier, namespace);
            obj["details"] = details;
        }
        else{
            obj["primitive"] = true;
        }
        return obj;
    }
    else if(type_specifier.title === "type_name"){
        var obj = {};
        var first_token = parse_tree_helper.get_first_token(type_specifier);
        obj["type"] = first_token.lexeme;
        obj["primitive"] = false;
        return obj;
    }
};


get_details_from_struct_or_union_specifier = function(type_specifier, namespace){
    /*
     *  struct_or_union_specifier -> struct_or_union IDENTIFIER '{' struct_declaration_list '}'
     *                             | struct_or_union '{' struct_declaration_list '}'
     *                             | struct_or_union IDENTIFIER
     * */
    var struct_or_union = parse_tree_helper.get_first_title_matching_subtree(type_specifier, "struct_or_union");
    if(type_specifier.children.length === 5 ){
        var struct_or_union_name = type_specifier.children[1].lexeme;
        var struct_or_union_members = get_members_from_struct_declaration_list(type_specifier.children[3], namespace);
        var name = {
            "name": struct_or_union_name,
            "token": _.clone(type_specifier.children[1]),
            "type": struct_or_union.children[0].lexeme,
            "members": struct_or_union_members
        };
        namespace["tags"].push(name);
        return {
            "name": struct_or_union_name
        };
    }
    else if(type_specifier.children.length === 4 ){
        var struct_or_union_members = get_members_from_struct_declaration_list(type_specifier.children[2], namespace);
        return {
            "members": struct_or_union_members
        };
    }
    else if(type_specifier.children.length === 2 ){
        var struct_or_union_name = type_specifier.children[1].lexeme;
        return {
            "name": struct_or_union_name
        };
    }
};


get_members_from_struct_declaration_list = function(struct_declaration_list, namespace){
    var members = [];
    var traverse_struct_declaration_list = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "struct_declaration"){
                get_members_from_struct_declaration(subtree, namespace, members);
                return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_struct_declaration_list(subtree.children[i]);
                }
                return;
            }
        }
    };

    traverse_struct_declaration_list(struct_declaration_list);
    return members;
};


get_members_from_struct_declaration = function(struct_declaration, namespace, members){
    /*
     * struct_declaration -> specifier_qualifier_list struct_declarator_list ';'
     * */
    var traverse_struct_declarator_list = function(subtree, specifiers_qualifiers){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var phrased_declarator = declarator_helper.get_phrasing_from_declarator(subtree);
                if(first_identifier && phrased_declarator){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers);
                    };
                    members.push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_init_declarator_list(subtree.children[i], specifiers_qualifiers);
                }
            }
        }
    };
    var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0]);
    traverse_struct_declarator_list(declaration.children[1], specifiers_qualifiers);
};


get_details_from_enum_specifier = function(enum_specifier, namespace){
    if(enum_specifier.children.length === 5){
        if(enum_specifier.children[1].tokenClass && enum_specifier.children[1].tokenClass === "IDENTIFIER"){
            var enum_name = enum_specifier.children[1].lexeme;
            var enum_members = get_members_from_enumerator_list(enum_specifier.children[3], namespace);
            var name = {
                "name": enum_name,
                "token": _.clone(enum_specifier.children[1]),
                "type": "enum",
                "members": enum_members
            };
            namespace["tags"].push(name);
            return {
                "name": enum_name
            };
        }
        else if(enum_specifier.children[1].tokenClass && enum_specifier.children[1].tokenClass === "{"){
            var enum_name = enum_specifier.children[1].lexeme;
            var enum_members = get_members_from_enumerator_list(enum_specifier.children[3], namespace);
            var name = {
                "name": enum_name,
                "token": _.clone(enum_specifier.children[1]),
                "type": "enum",
                "members": enum_members
            };
            namespace["tags"].push(name);
            return {
                "name": enum_name
            };
        }
    }
    else if(enum_specifier.children.length === 4){
    }
    else if(enum_specifier.children.length === 6){
    }
    else if(enum_specifier.children.length === 2){
    }
};
