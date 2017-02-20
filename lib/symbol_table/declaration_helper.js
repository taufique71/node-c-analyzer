var _ = require("lodash");

var get_meaning_from_declarator;
var get_meaning_from_direct_declarator;
var get_meaning_from_pointer;
var get_meaning_from_type_qualifier_list;
var get_meaning_from_direct_declarator_p;
var get_meaning_from_type_name;
var get_meaning_from_type_specifier;
var get_meaning_from_type_qualifier;
var get_meaning_from_storage_class_specifier;

var get_details_from_declaration_specifiers;

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

get_meaning_from_type_name = function(type_name){
    if(type_name.children[0].tokenClass) return type_name.children[0].lexeme;
    else return "";
};
module.exports.get_meaning_from_type_name = get_meaning_from_type_name;



var get_meaning_from_type_specifier;
get_meaning_from_type_qualifier = function(type_qualifier){
    return type_qualifier.children[0].lexeme;
};

get_meaning_from_storage_class_specifier = function(storage_class_specifier){
    return storage_class_specifier.children[0].lexeme;
};

get_details_from_declaration_specifiers = function(declaration_specifiers){
    
};
