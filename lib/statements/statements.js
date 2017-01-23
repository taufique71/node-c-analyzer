var statement_helper = require("./statement_helper");
var parse_tree_helper = require("../utility/parse_tree_helper");
var _ = require("lodash");

var get_statement_list = function(parse_tree){
    var statement_list = [];
    var traverse = function(subtree, annotated_scope){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            switch( subtree.title ){
                case "function_definition":
                    var declarator = subtree.children[1];
                    var first_identifier = parse_tree_helper.get_first_token(declarator, "IDENTIFIER");
                    annotated_scope = annotated_scope + "/" + first_identifier.lexeme;
                    break;
                case "selection_stmt":
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    annotated_scope = annotated_scope + "/" + first_token.lexeme;
                    break;
                case "iteration_stmt":
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    annotated_scope = annotated_scope + "/" + first_token.lexeme;
                    break;
                default:
                    break;
            }
            if((subtree.title === "jump_stmt") || 
               (subtree.title === "expression_stmt") ||
               (subtree.title === "labeled_stmt") ||
               (subtree.title === "declaration" && subtree.parent.title === "block_item") ){
                var raw_statement = statement_helper.construct_statement(subtree);
                var token_list = statement_helper.get_token_list(subtree);
                var statement = {
                    "statement": raw_statement,
                    "line_no": token_list[0].row,
                    "identifiers": _.filter(token_list, function(o){ return (o.tokenClass === "IDENTIFIER"); }),
                    "keywords": _.filter(token_list, function(o){ return (o.keyword === "true"); }),
                    "constants": _.filter(token_list, function(o){ return (o.tokenClass === "CONSTANT"); }),
                    "scope_path": annotated_scope
                };
                statement_list.push(statement);
            }
            else{
                for(var i = 0; i < subtree.children.length; i++){
                    traverse(subtree.children[i], annotated_scope);
                }
            }
        }
    };

    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        parse_tree_helper.add_parent_edges(parse_tree);
        traverse(parse_tree, "file_scope");
        return statement_list;
    }
}
module.exports.get_statement_list = get_statement_list;
