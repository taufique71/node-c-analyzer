var _ = require("lodash");
var parse_tree_helper = require("./../utility/parse_tree_helper");

var get_meaning_from_declarator;
var get_meaning_from_direct_declarator;
var get_meaning_from_pointer;
var get_meaning_from_type_qualifier_list;
var get_meaning_from_direct_declarator_p;
var get_declaration_specifiers;
var get_type_qualifiers;
var get_storage_class_specifiers;
var get_type_specifiers;
var get_info_from_type_specifier;
var get_details_from_struct_or_union_specifier;
var get_details_from_enum_specifier;

get_meaning_from_declarator = function(declarator){
    /*
     *  declarator -> pointer direct_declarator
     *              | direct_declarator
     * */
    if(declarator.children.length === 1){
        /* This means that declarator has only one child which is direct_declarator */
        var direct_declarator_meaning = get_meaning_from_direct_declarator(declarator.children[0]);
        return direct_declarator_meaning;
    }
    else if(declarator.children.length === 2){
        /* This means that declarator has only two children - first one is pointer second one is direct_declarator */
        var pointer_meaning = get_meaning_from_pointer(declarator.children[0]);
        var direct_declarator_meaning = get_meaning_from_direct_declarator(declarator.children[0]);
        return direct_declarator_meaning + " " + pointer_meaning;
    }
};
module.exports.get_meaning_from_declarator = get_meaning_from_declarator;

get_meaning_from_direct_declarator = function(direct_declarator){
    /*
     *  direct_declarator -> IDENTIFIER direct_declarator_p
     *                     | '(' declarator ')' direct_declarator_p
     * */
    if(direct_declarator.children.length === 2){
        var direct_declarator_p_meaning = get_meaning_from_direct_declarator_p(direct_declarator.children[1]);
        return direct_declarator_p_meaning;
    }
    else if(direct_declarator.children.length === 4){
        var declarator_meaning = get_meaning_from_declarator(direct_declarator.children[1]);
        var direct_declarator_p_meaning = get_meaning_from_direct_declarator_p(direct_declarator.children[3]);
        return declarator_meaning + " " + direct_declarator_p_meaning;
    }
};
module.exports.get_meaning_from_direct_declarator = get_meaning_from_direct_declarator;

get_meaning_from_pointer = function(pointer){
    /*
     *  pointer -> '*' type_qualifier_list pointer
     *           | '*' type_qualifier_list
     *           | '*' pointer
     *           | '*' 
     * */
    if(pointer.children.length === 1){
        return "pointer to";
    }
    else if((pointer.children.length === 2) && (pointer.children[1].title === "pointer")){
        var pointer_meaning = get_meaning_from_pointer(pointer.children[1]);
        return pointer_meaning + " " + "pointer to";
    }
    else if((pointer.children.length === 2) && (pointer.children[1].title === "type_qualifier_list")){
        var type_qualifier_list_meaning = get_meaning_from_type_qualifier_list(pointer.children[1]);
        return type_qualifier_list_meaning + " " + "pointer to";
    }
    if(pointer.children.length === 3){
        var pointer_meaning = get_meaning_from_pointer(pointer.children[2]);
        var type_qualifier_list_meaning = get_meaning_from_type_qualifier_list(pointer.children[1]);
        return pointer_meaning + " " + type_qualifier_list_meaning + " " + "pointer to";
    }
}
module.exports.get_meaning_from_pointer = get_meaning_from_pointer;

get_meaning_from_type_qualifier_list = function( type_qualifier_list ){
    var token_list = [];
    var traverse_for_token_list = function(subtree){
        if( subtree.tokenClass ){
            token_list.push(_.clone(subtree));
            return;
        }
        else{
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse_for_token_list(subtree.children[i]);
                }
                return;
            }
        }
    };
    traverse_for_token_list(type_qualifier_list);

    // sort token_list according to their occurance in the original code file
    token_list.sort(function(token_1, token_2){
        return (token_1.col - token_2.col);
    });

    // now construct the statement concatenating all the tokens according to their location in the original code file
    var tql = "";
    for(var i = 0; i < token_list.length; i++){
        if(i > 0){
            var prev_tok = token_list[i-1];
            tql = tql + " ".repeat(token_list[i].col - ( token_list[i-1].col + token_list[i-1].lexeme.length ) );
        }
        tql = tql + token_list[i].lexeme;
    }

    return tql;
};
module.exports.get_meaning_type_qualifier_list = get_meaning_from_type_qualifier_list;

get_meaning_from_direct_declarator_p = function( direct_declarator_p ){
    /*
     *  direct_declarator_p -> '[' type_qualifier_list assignment_expr ']' direct_declarator_p
     *                       | '[' type_qualifier_list ']' direct_declarator_p
     *                       | '[' assignment_expr ']' direct_declarator_p
     *                       | '[' STATIC type_qualifier_list assignment_expr ']' direct_declarator_p
     *                       | '[' type_qualifier_list STATIC assignment_expr ']' direct_declarator_p
     *                       | '[' type_qualifier_list '*' ']' direct_declarator_p
     *                       | '[' '*' ']' direct_declarator_p
     *                       | '[' ']' direct_declarator_p
     *                       | '(' 'parameter_type_list' ')' direct_declarator_p
     *                       | '(' identifier_list ')' direct_declarator_p
     *                       | '(' ')' direct_declarator_p
     *                       | EPSILON
     * */
    if(direct_declarator_p.children.length === 1){
        return "";
    }
    else if( direct_declarator_p.children[0].tokenClass && (direct_declarator_p.children[0].tokenClass === "[")){
        var direct_declarator_p_meaning = get_meaning_from_direct_declarator_p(direct_declarator_p.children[direct_declarator_p.children.length - 1]);
        return direct_declarator_p_meaning + " " + "array of";
    }
    else if( direct_declarator_p.children[0].tokenClass && (direct_declarator_p.children[0].tokenClass === "(")){
        var direct_declarator_p_meaning = get_meaning_from_direct_declarator_p(direct_declarator_p.children[direct_declarator_p.children.length - 1]);
        return direct_declarator_p_meaning + " " + "function returning";
    }
};
module.exports.get_meaning_from_direct_declarator_p = get_meaning_from_direct_declarator_p;

get_declaration_specifiers = function(declaration_specifiers, namespace){
    var type_qualifiers = get_type_qualifiers(declaration_specifiers, namepsace);
    var storage_class_specifiers = get_storage_class_specifiers(declaration_specifiers, namespace);
    var type_specifiers = get_type_specifiers(declaration_specifiers, namespace);
    var obj = {
        "type_qualifiers": type_qualifiers,
        "storage_class_specifiers": storage_class_specifiers,
        "type_specifiers": type_specifiers
    };
    return obj;
};
module.exports.get_declaration_specifiers = get_declaration_specifiers;





/*
 * Given a declaration_specifiers subtree, this function return a list containing all type_qualifiers used
 * within the declaration_specifiers
 * */
get_type_qualifiers = function(declaration_specifiers, namespace){
    var type_qualifiers = [];
    if(declaration_specifiers.title === "declaration_specifiers"){
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
        traverse(declaration_specifiers);
    }
    return type_qualifiers;
};
module.exports.get_type_qualifiers = get_type_qualifiers;





/*
 * Given a declaration_specifiers subtree, this function return a list containing all storage_class_specifiers used
 * within the declaration_specifiers
 * */
get_storage_class_specifiers = function(declaration_specifiers, namespace){
    var storage_class_specifiers = [];
    if(declaration_specifiers.title === "declaration_specifiers"){
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
        traverse(declaration_specifiers);
    }
    return storage_class_specifiers;
};
module.exports.get_storage_class_specifiers = get_storage_class_specifiers;





/*
 * Given a declaration_specifiers subtree, this function return a list containing all type_specifiers used
 * within the declaration_specifiers
 * */
get_type_specifiers = function(declaration_specifiers, namespace){
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
    traverse(declaration_specifiers);
    return type_specifiers;
};
module.exports.get_type_specifiers = get_type_specifiers;

get_info_from_type_specifier = function(type_specifier, namespace){
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
};
module.exports.get_info_from_type_specifier = get_info_from_type_specifier;
