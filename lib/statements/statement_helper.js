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
                for(var i = 0; i < subtree.children; i++){
                    traverse_for_token_list(subtree.children[i]);
                }
                return;
            }
        }
    };
    traverse_for_token_list(stmt_tree);

    // Sort token_list according to their occurance in the original code file
    token_list.sort(function(token_1, token_2){
        return (token_1.col - token_2.col);
    });

    // Now construct the statement concatenating all the tokens according to their location in the original code file
    var statement = "";
    for(var i = 0; i < token_list.length; i++){
        if(i > 0){
            var prev_tok = token_list[i-1];
            statement = statement + " ".repeat(token_list[i].col - ( token_list[i-1].col + token_list[i-1].lexeme.length ) );
        }
        statement = statement + token_list[i];
    }
    return statement;
}
module.exports.construct_statement = construct_statement;
