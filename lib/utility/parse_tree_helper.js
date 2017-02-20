var _ = require("lodash");

var add_parent_edges;
var get_first_token;
var get_last_token;
var get_first_title_matching_subtree;
var is_function_declaration;
var is_typedef_declaration;
var is_record_declaration;
var is_variable_declaration;
var construct_type_expr;
var get_pointer_expr;



/*
 * This function adds parent edge for each nodes in a given subtree
 * */
add_parent_edges = function(subtree){
    if(subtree) parse_tree["parent"] = null;
    var traverse = function(subtree){
        if(subtree === null) return;
        if(!subtree.children){
            subtree.children = [];
        }
        for(var i = 0; i < subtree.children.length; i++){
            if(subtree.children[i]){
                subtree.children[i]["parent"] = subtree;
                traverse(subtree.children[i]);
            }
        }
    };
    traverse(subtree);
};
module.exports.add_parent_edges = add_parent_edges;



/*
 * This function returns the very first token under a given subtree matching the given token class
 * */
get_first_token = function(subtree, expected_token_class){
    if(subtree){
        if(subtree.tokenClass ){
            if( expected_token_class ){
                if( expected_token_class === subtree.tokenClass ) return subtree;
                else return null;
            }
            else return subtree;
        }
        else{
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return null;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    var tok = get_first_token(subtree.children[i], expected_token_class);
                    if(tok) return tok;
                }
                return null;
            }
        }
    }
    else return null;
};
module.exports.get_first_token = get_first_token;



/*
 * This function returns the very last token under a given subtree matching the given token class
 * */
get_last_token = function(subtree, expected_token_class){
    if( subtree.tokenClass ){
        if( expected_token_class ){
            if( expected_token_class === subtree.tokenClass ) return subtree;
            else return null;
        }
        else return subtree;
    }
    else{
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return null;
        }
        else{
            for(var i = subtree.children.length - 1 ; i >= 0; i--){
                var tok = get_last_token(subtree.children[i], expected_token_class);
                if(tok) return tok;
            }
            return null;
        }
    }
};
module.exports.get_last_token = get_last_token;



get_first_title_matching_subtree = function(subtree, title_to_match){
    if( subtree.title === title_to_match ){
        return subtree;
    }
    else if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
        return null;
    }
    else{
        for(var i = 0; i < subtree.children.length; i++){
            var st = get_first_title_matching_subtree(subtree.children[i], title_to_match);
            if(st) return st;
        }
        return null;
    }
};
module.exports.get_first_title_matching_subtree = get_first_title_matching_subtree;



/*
 * Given a declaration subtree it return true or false.
 * If function declaration then it returns true.
 * Otherwise returns false.
 * */
is_function_declaration = function(declaration){
    var direct_declarator, direct_declarator_p;

    var traverse = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            if(subtree.title === "direct_declarator"){
                direct_declarator = subtree;
                return;
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i]);
                }
            }
        }
    };

    traverse(declaration);
    if(direct_declarator.children[0].tokenClass === "(") return true;
    else{
        var direct_declarator_p = direct_declarator.children[1];
        if(direct_declarator_p.children[0].tokenClass === "(") return true;
        else return false;
    }
};
module.exports.is_function_declaration = is_function_declaration;



/*
 * Given a declaration subtree return true or false depending on whether the 
 * declaration is a typedef declaration or not. If it is a typedef declaration then
 * it returns true, else returns false.
 * */
is_typedef_declaration = function(declaration){
    /*
     * From grammar it is evident that all typedef declarations will have a token 
     * containing keyword "typedef" as prefix. So the verdict containing whether 
     * or not this declaration is a typedef can be given easily by taking a look
     * at the first token;
     * */
    var first_token = get_first_token(declaration);
    if(first_token.tokenClass === "TYPEDEF") return true;
    else return false;
};
module.exports.is_typedef_declaration = is_typedef_declaration;



/*
 * Given a declaration subtree it returns true or false.
 * If the the declaration is a record (struct, union or enum) declaration 
 * it return true. Otherwise it return false.
 * */
is_record_declaration = function(declaration){
    /*
     * From grammar rule it's evident that if declaration subtree has two children
     * then it is either a struct or union or enum declaration
     * */
    if(declaration.children.length === 2){
        var first_type_specifier = parse_tree_helper.get_first_title_matching_subtree(declaration, "type_specifier");
        if(!first_type_specifier) return false;
        else{
            var first_token = parse_tree_helper.get_first_token(first_type_specifier);
            if(first_token.tokenClass === "STRUCT") return true;
            else if(first_token.tokenClass === "UNION") return true;
            else if(first_token.tokenClass === "ENUM") return true;
            else return false;
        }
    }
    else return false;
};
module.exports.is_record_declaration = is_record_declaration;



/*
 * This function returns a stringified expression of type info
 * from specifier_qualifier_list or declaration_specifiers subtree
 * */
construct_type_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if( (subtree.children === null) && (subtree.tokenClass) ){
        return subtree.lexeme;
    }
    else{
        if((subtree.title === "struct_or_union_specifier") || (subtree.title === "enum_specifier")){
            var first_token = get_first_token(subtree, null);
            var first_identifier = get_first_token(subtree, "IDENTIFIER");
            var expr = first_token.lexeme + " " + first_identifier.lexeme;
            return expr;
        }
        else{
            var expr = "";
            for(var i = 0; i < subtree.children.length; i++){
                var temp = construct_type_expr(subtree.children[i]);
                if(temp === "") continue;
                else {
                    if(expr.length === 0) expr = expr + temp;
                    else{
                        if(expr[expr.length - 1] === " ") expr = expr + temp;
                        else expr = expr + " " + temp;
                    }
                }
            }
            return expr;
        }
    }
};
module.exports.construct_type_expr = construct_type_expr;



/*
 * Returns stringified expression of pointers
 * */
get_pointer_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if((subtree.children === null) && (subtree.tokenClass)){
        if(subtree.tokenClass === "*") return subtree.lexeme;
        else return "";
    }
    else{
        var expr = "";
        for(var i = 0; i < subtree.children.length; i++){
            expr = expr + get_pointer_expr(subtree.children[i]);
        }
        return expr;
    }
};
module.exports.get_pointer_expr = get_pointer_expr;
