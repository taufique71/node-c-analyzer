/*
 * This function adds parent edge to each terminal and non-terminal nodes in parse tree
 * */
var add_parent_edges = function(parse_tree){
    if(parse_tree) parse_tree["parent"] = null;
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
    traverse(parse_tree);
};
module.exports.add_parent_edges = add_parent_edges;

/*
 * This function returns the very first token under a subtree
 * */
var get_first_token = function(subtree, expected_token_class){
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
 * This function returns the very last token ending the scope
 * */
var get_last_token = function(subtree, expected_token_class){
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

/*
 * Given a subtree and a title to match this function returns the first subtree matching the title resided under the given subtree.
 * */
var get_first_title_matching_subtree = function(subtree, title_to_match){
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
var is_function_declaration = function(declaration){
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
 * Given a declaration subtree it returns true or false.
 * If the the declaration is struct, union or enum declaration it return true.
 * Otherwise it return false.
 * */
var is_struct_union_or_enum_declaration = function(declaration){
    /*
     * From grammar rule it's evident that if declaration subtree has two children
     * then it is either a struct or union or enum declaration
     * */
    if(declaration.children.length === 2) return true;
    else return false;
};
module.exports.is_struct_union_or_enum_declaration = is_struct_union_or_enum_declaration;

/*
 * Given a declaration_specifiers subtree it returns true or false.
 * If the declaration_specifiers is for structure it return true.
 * Otherwise it return false.
 * */
var is_struct_declaration = function(declaration_specifiers){
    if(declaration_specifiers.children[0].title === "type_specifier"){
        var type_specifier = declaration_specifiers.children[0];
        if(type_specifier.children[0].title === "struct_or_union_specifier"){
            var struct_or_union_specifier = type_specifier.children[0];
            var struct_or_union = struct_or_union_specifier.children[0];
            if(struct_or_union.tokenClass = "STRUCT") return true;
            else return false;
        }
        else return false;
    }
    else return false;
};
module.exports.is_struct_declaration = is_struct_declaration;

/*
 * Given a declaration_specifiers subtree it returns true or false.
 * If the declaration_specifiers is for union it return true.
 * Otherwise it return false.
 * */
var is_union_declaration = function(declaration_specifiers){
    if(declaration_specifiers.children[0].title === "type_specifier"){
        var type_specifier = declaration_specifiers.children[0];
        if(type_specifier.children[0].title === "struct_or_union_specifier"){
            var struct_or_union_specifier = type_specifier.children[0];
            var struct_or_union = struct_or_union_specifier.children[0];
            if(struct_or_union.tokenClass = "UNION") return true;
            else return false;
        }
        else return false;
    }
    else return false;
};
module.exports.is_union_declaration = is_union_declaration;

/*
 * Given a declaration_specifiers subtree it returns true or false.
 * If the declaration_specifiers is for enum it return true.
 * Otherwise it return false.
 * */
var is_enum_declaration = function(declaration_specifiers){
    if(declaration_specifiers.children[0].title === "type_specifier"){
        var type_specifier = declaration_specifiers.children[0];
        if(type_specifier.children[0].title === "enum_specifier") return true;
        else return false;
    }
    else return false;
};
module.exports.is_enum_declaration = is_enum_declaration;

/*
 * This function returns a stringified expression of type info
 * from specifier_qualifier_list or declaration_specifiers subtree
 * */
var construct_type_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if( (subtree.children === null) && (subtree.tokenClass) ){
        if(subtree.tokenClass === "TYPEDEF") return "";
        else return subtree.lexeme;
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
var get_pointer_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if((subtree.children === null) && (subtree.tokenClass)){
        if(subtree.tokenClass === "*") return subtree.lexeme;
        else return "";
    }
    else{
        var expr = "";
        if(subtree.title === "parameter_type_list"){
            /* Leave expr as it is */
        }
        else{
            for(var i = 0; i < subtree.children.length; i++){
                expr = expr + get_pointer_expr(subtree.children[i]);
            }
        }
        return expr;
    }
};
module.exports.get_pointer_expr = get_pointer_expr;

var is_typedef_declaration = function(declaration){
    var storage_class_specifier = get_first_title_matching_subtree(declaration, "storage_class_specifier");
    if(storage_class_specifier){
        if(storage_class_specifier.children[0].tokenClass === "TYPEDEF") return true;
        else return false;
    }
    else return false;
}
module.exports.is_typedef_declaration = is_typedef_declaration;
