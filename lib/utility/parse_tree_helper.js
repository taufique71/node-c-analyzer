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
 * This function returns the very first token starting the scope
 * */
var get_first_token = function(subtree){
    if(subtree.tokenClass){
        return subtree;
    }
    else{
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return null;
        }
        else{
            for(var i = 0; i < subtree.children.length; i++){
                var tok = get_first_token(subtree.children[i]);
                if(tok) return tok;
            }
            return null;
        }
    }
};
module.exports.get_first_token = get_first_token;

/*
 * This function returns the very last token ending the scope
 * */
var get_last_token = function(subtree){
    if(subtree.tokenClass){
        return subtree;
    }
    else{
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return null;
        }
        else{
            for(var i = subtree.children.length - 1 ; i >= 0; i--){
                var tok = get_last_token(subtree.children[i]);
                if(tok) return tok;
            }
            return null;
        }
    }
};
module.exports.get_last_token = get_last_token;

/*
 * This function returns the very first identifier token for given subtree
 * */
var get_first_identifier = function(subtree){
    if(subtree.tokenClass && (subtree.tokenClass==="IDENTIFIER")){
        return subtree;
    }
    else{
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return null;
        }
        else{
            for(var i = 0; i < subtree.children.length; i++){
                var tok = get_first_identifier(subtree.children[i]);
                if(tok) return tok;
            }
            return null;
        }
    }
};
module.exports.get_first_identifier = get_first_identifier;

/*
 * Get first subtree for type_specifier rules under given subtree
 * */
var get_first_type_specifier = function(subtree){
    if( subtree.title === "type_specifier" ){
        return subtree;
    }
    else if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
        return null;
    }
    else{
        for(var i = 0; i < subtree.children.length; i++){
            var ts = get_first_type_specifier(subtree.children[i]);
            if(ts) return ts;
        }
        return null;
    }
};
module.exports.get_first_type_specifier = get_first_type_specifier;

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
 * Returns name of the function from function definition sub-parsetree
 * */
var get_function_id_token = function(function_definition){
    var declarator, direct_declarator, func_id_token;
    for(var i = 0 ; i < function_definition.children.length; i++){
        if(function_definition.children[i].title === "declarator"){
            declarator = function_definition.children[i];
            break;
        }
    }
    for(var i = 0 ; i < declarator.children.length; i++){
        if(declarator.children[i].title === "direct_declarator"){
            direct_declarator = declarator.children[i];
            break;
        }
    }
    for(var i = 0 ; i < direct_declarator.children.length; i++){
        if(direct_declarator.children[i].tokenClass && (direct_declarator.children[i].tokenClass === "IDENTIFIER")){
            func_id_token = direct_declarator.children[i];
            break;
        }
    }
    return func_id_token.lexeme;
};
module.exports.get_function_id_token = get_function_id_token;

var get_primary_type = function(declaration_specifiers){
    var primary_type_expr = "";
    var type_specifier = null;
    if(is_struct_declaration(declaration_specifiers) ||
       is_union_declaration(declaration_specifiers) ||
       is_enum_declaration(declaration_specifiers)){
        type_specifier = get_first_type_specifier(declaration_specifiers);
        if(type_specifier){
            var first_token = null;
            first_token = get_first_token(type_specifier);
            if(first_token){
                var first_identifier = null;
                first_identifier = get_first_identifier(type_specifier);
                if(first_identifier) primary_type_expr = first_token.lexeme + " " + first_identifier.lexeme;
                else primary_type_expr = first_token.lexeme;
            }
        }
    }
    else{
        type_specifier = get_first_type_specifier(declaration_specifiers);
        if(type_specifier){
            var first_token = null;
            first_token = get_first_token(type_specifier);
            if(first_token) primary_type_expr = first_token.lexeme;
        }
    }
    return primary_type_expr;
};
module.exports.get_primary_type = get_primary_type;

/*
 * This function returns a stringified expression of type info
 * from specifier_qualifier_list subtree
 * */
var construct_type_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if( (subtree.children === null) && (subtree.tokenClass) ){
        return subtree.lexeme;
    }
    else{
        if((subtree.title === "struct_or_union_specifier") || (subtree.title === "enum_specifier")){
            var first_token = get_first_token(subtree);
            var first_identifier = get_first_identifier(subtree);
            var expr = first.token.lexeme + " " + first_identifier.lexeme;
            return expr;
        }
        else{
            var expr = "";
            for(var i = 0; i < subtree.children.length; i++){
                expr = expr + construct_type_expr(subtree.children[i]);
                if(i > 0) expr += " ";
            }
            return expr;
        }
    }
};
module.exports.construct_type_expr = construct_type_expr;

var get_pointer_expr = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON") || (subtree.title === "type_qualifier_list")){
        return "";
    }
    else if((subtree.children === null) && (subtree.tokenClass) && (subtree.tokenClass === "*")){
        return subtree.lexeme;
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

var get_direct_declarator_p_expression = function(subtree){
    if((subtree === null) || (subtree.title === "EPSILON")){
        return "";
    }
    else if((subtree.children === null) && (subtree.tokenClass)){
        return subtree.lexeme;
    }
    else{
        var expr = "";
        for(var i = 0; i < subtree.children.length; i++){
            expr = expr + get_direct_declarator_p_expression(subtree.children[i]);
        }
        return expr;
    }
};

var get_info_from_direct_declarator = function(direct_declarator){
    var first_identifier = get_first_identifier(direct_declarator);
    var direct_declarator_p_expr = get_direct_declarator_p_expression(direct_declarator.children[direct_declarator.children.length-1]);
    return {
        "id": first_identifier,
        "direct_declarator_p_expr": direct_declarator_p_expr
    };
};
module.exports.get_info_from_direct_declarator = get_info_from_direct_declarator;
