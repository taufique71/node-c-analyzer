var _ = require("lodash");
var parse_tree_helper = require("../utility/parse_tree_helper");
var statement_helper = require("../statements/statement_helper");
var declarator_helper = require("./declarator_helper");

var handle_labeled_stmt;
var handle_function_definition;
var handle_declaration;
var handle_parameter_declaration;
var get_specifiers_qualifiers;
var get_type_qualifiers;
var get_storage_class_specifiers;
var get_type_specifiers;
var get_info_from_type_specifier;
var get_details_from_struct_or_union_specifier;
var get_members_from_struct_declaration_list;
var get_members_from_struct_declaration;
var get_details_from_enum_specifier;
var get_members_from_enumerator_list;

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
    var traverse_init_declarator_list = function(subtree, specifiers_qualifiers){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var phrased_declarator = declarator_helper.get_phrasing_from_declarator(subtree);
                if(first_identifier){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers),
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
    if(function_definition.children[0].title === "declaration_specifiers"){
        var specifiers_qualifiers = get_specifiers_qualifiers(function_definition.children[0], namespace);
        traverse_init_declarator_list(function_definition.children[1], specifiers_qualifiers);
    }
    else if(function_definition.children[0].title === "type_name"){
        var specifiers_qualifiers = get_specifiers_qualifiers(function_definition.children[0], namespace);
        traverse_init_declarator_list(function_definition.children[1], specifiers_qualifiers);
    }
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
                if(first_identifier){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers),
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
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0], namespace);
            traverse_init_declarator_list(declaration.children[1], specifiers_qualifiers);
        }
        else if(declaration.children.length === 2){
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0], namespace);
        }
    }
    else if(declaration.children[0].title === "type_name"){
        if(declaration.children.length === 3){
            var specifiers_qualifiers = get_specifiers_qualifiers(declaration.children[0], namespace);
            traverse_init_declarator_list(declaration.children[1], specifiers_qualifiers);
        }
    }
};
module.exports.handle_declaration = handle_declaration;


handle_parameter_declaration = function(parameter_declaration, namespace){
    var traverse_init_declarator_list = function(subtree, specifiers_qualifiers){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "declarator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                var phrased_declarator = declarator_helper.get_phrasing_from_declarator(subtree);
                if(first_identifier){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers),
                        "parameter": true
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
    if(parameter_declaration.children[0].title === "declaration_specifiers"){
        if(parameter_declaration.children.length === 2){
            if(parameter_declaration.children[1].title === "declarator"){
                var specifiers_qualifiers = get_specifiers_qualifiers(parameter_declaration.children[0], namespace);
                traverse_init_declarator_list(parameter_declaration.children[1], specifiers_qualifiers);
            }
            else{
                /* Abstract declarator, do nothing for now. */
            }
        }
        else if(parameter_declaration.children.length === 1){
            var specifiers_qualifiers = get_specifiers_qualifiers(parameter_declaration.children[0], namespace);
        }
    }
    else if(parameter_declaration.children[0].title === "type_name"){
        if(parameter_declaration.children.length === 3){
            var specifiers_qualifiers = get_specifiers_qualifiers(parameter_declaration.children[0], namespace);
            traverse_init_declarator_list(parameter_declaration.children[1], specifiers_qualifiers);
        }
    }
};
module.exports.handle_parameter_declaration = handle_parameter_declaration;

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
            var details = get_details_from_struct_or_union_specifier(type_specifier.children[0], namespace);
            obj["details"] = details;
        }
        else if(obj.type === "enum"){
            obj["primitive"] = false;
            var details = get_details_from_enum_specifier(type_specifier.children[0], namespace);
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


get_details_from_struct_or_union_specifier = function(struct_or_union_specifier, namespace){
    /*
     *  struct_or_union_specifier -> struct_or_union IDENTIFIER '{' struct_declaration_list '}'
     *                             | struct_or_union '{' struct_declaration_list '}'
     *                             | struct_or_union IDENTIFIER
     * */
    var struct_or_union = parse_tree_helper.get_first_title_matching_subtree(struct_or_union_specifier, "struct_or_union");
    if(struct_or_union_specifier.children.length === 5 ){
        var struct_or_union_name = struct_or_union_specifier.children[1].lexeme;
        var struct_or_union_members = get_members_from_struct_declaration_list(struct_or_union_specifier.children[3], namespace);
        var name = {
            "name": struct_or_union_name,
            "token": _.clone(struct_or_union_specifier.children[1]),
            "type": struct_or_union.children[0].lexeme,
            "members": struct_or_union_members
        };
        namespace["tags"].push(name);
        return {
            "name": struct_or_union_name
        };
    }
    else if(struct_or_union_specifier.children.length === 4 ){
        var struct_or_union_members = get_members_from_struct_declaration_list(struct_or_union_specifier.children[2], namespace);
        return {
            "members": struct_or_union_members
        };
    }
    else if(struct_or_union_specifier.children.length === 2 ){
        var struct_or_union_name = struct_or_union_specifier.children[1].lexeme;
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
                if(first_identifier){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": phrased_declarator,
                        "specifiers_qualifiers": _.clone(specifiers_qualifiers),
                    };
                    members.push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_struct_declarator_list(subtree.children[i], specifiers_qualifiers);
                }
            }
        }
    };
    var specifiers_qualifiers = get_specifiers_qualifiers(struct_declaration.children[0]);
    traverse_struct_declarator_list(struct_declaration.children[1], specifiers_qualifiers);
};


get_details_from_enum_specifier = function(enum_specifier, namespace){
    /*
     *  enum_specifier -> ENUM IDENTIFIER '{' enumerator_list '}'
     *                  | ENUM '{' enumerator_list '}'
     *                  | ENUM IDENTIFIER '{' enumerator_list ',' '}'
     *                  | ENUM '{' enumerator_list ',' '}'
     *                  | ENUM IDENTIFIER
     * */
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
            var enum_members = get_members_from_enumerator_list(enum_specifier.children[2], namespace);
            var name = {
                "name": enum_name,
                "token": _.clone(enum_specifier.children[1]),
                "type": "enum",
                "members": enum_members
            };
            namespace["tags"].push(name);
            return {
                "members": enum_members
            };
        }
    }
    else if(enum_specifier.children.length === 4){
        var enum_members = get_members_from_enumerator_list(enum_specifier.children[3], namespace);
        return {
            "members": enum_members
        };
    }
    else if(enum_specifier.children.length === 6){
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
    else if(enum_specifier.children.length === 2){
        var enum_name = enum_specifier.children[1].lexeme;
        return {
            "name": enum_name
        };
    }
};

get_members_from_enumerator_list = function(enumerator_list, namespace){
    /*
     *  enumerator_list -> enumerator enumerator_list_p
     * */
    var members = [];
    var traverse_enumerator_list = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "enumerator"){
                var first_identifier = parse_tree_helper.get_first_token(subtree, "IDENTIFIER");
                if(first_identifier){
                    var name = {
                        "name": first_identifier.lexeme,
                        "token": _.clone(first_identifier),
                        "declarator": "enumerator"
                    };
                    members.push(name);
                    namespace["ordinary_ids"].push(name);
                    return;
                }
                else return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_enumerator_list(subtree.children[i]);
                }
            }
        }
    };
    traverse_enumerator_list(enumerator_list);
    return members;
};
