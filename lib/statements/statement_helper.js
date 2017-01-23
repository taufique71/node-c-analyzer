var _ = require("lodash");

var construct_statement = function(stmt_tree){
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
    traverse_for_token_list(stmt_tree);

    // sort token_list according to their occurance in the original code file
    token_list.sort(function(token_1, token_2){
        return (token_1.col - token_2.col);
    });

    // now construct the statement concatenating all the tokens according to their location in the original code file
    var statement = "";
    for(var i = 0; i < token_list.length; i++){
        if(i > 0){
            var prev_tok = token_list[i-1];
            statement = statement + " ".repeat(token_list[i].col - ( token_list[i-1].col + token_list[i-1].lexeme.length ) );
        }
        statement = statement + token_list[i].lexeme;
    }

    return statement;
}
module.exports.construct_statement = construct_statement;

var get_token_list = function(stmt_tree){
    var token_list = [];
    var traverse_for_token_list = function(subtree){
        if( subtree.tokenClass ){
            var token = _.clone(subtree);
            delete token.parent;
            delete token.children;
            token_list.push(token);
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
    traverse_for_token_list(stmt_tree);

    return token_list;
}
module.exports.get_token_list = get_token_list;
