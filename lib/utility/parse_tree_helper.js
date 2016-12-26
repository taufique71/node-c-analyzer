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
 * This function returns the very first token starting the scope
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
 *   Returns name of the function from function definition sub-parsetree
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
