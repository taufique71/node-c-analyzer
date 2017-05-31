var statement_helper = require("./statement_helper");
var parse_tree_helper = require("../utility/parse_tree_helper");
var _ = require("lodash");

var get_statement_list = function(parse_tree){
    var traverse = function(subtree, stmt_list){
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        else{
            switch( subtree.title ){
                case "declaration":
                    var raw_stmt = statement_helper.construct_statement(subtree);
                    var token_list = statement_helper.get_token_list(subtree);
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "raw": raw_stmt,
                        "tokens": token_list,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        }
                    };
                    stmt_list.push(stmt);
                    break;
                case "expression_stmt":
                    var raw_stmt = statement_helper.construct_statement(subtree);
                    var token_list = statement_helper.get_token_list(subtree);
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "raw": raw_stmt,
                        "tokens": token_list,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        }
                    };
                    stmt_list.push(stmt);
                    break;
                case "expr":
                    var raw_stmt = statement_helper.construct_statement(subtree);
                    var token_list = statement_helper.get_token_list(subtree);
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "raw": raw_stmt,
                        "tokens": token_list,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        }
                    };
                    stmt_list.push(stmt);
                    break;
                case "jump_stmt":
                    var raw_stmt = statement_helper.construct_statement(subtree);
                    var token_list = statement_helper.get_token_list(subtree);
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "raw": raw_stmt,
                        "tokens": token_list,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        }
                    };
                    stmt_list.push(stmt);
                    break;
                case "labeled_stmt":
                    var raw_stmt = statement_helper.construct_statement(subtree);
                    var token_list = statement_helper.get_token_list(subtree);
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "raw": raw_stmt,
                        "tokens": token_list,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        }
                    };
                    stmt_list.push(stmt);
                    break;
                case "iteration_stmt":
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        },
                        "initialization": [],
                        "condition": [],
                        "incrementation": [],
                        "body": []
                    };
                    if(first_token.lexeme === "for"){
                        if(subtree.children.length === 6){
                            if(subtree.children[2].title === "expression_stmt"){
                                traverse(subtree.children[2], stmt["condition"]);
                                traverse(subtree.children[3], stmt["incrementation"]);
                                traverse(subtree.children[5], stmt["body"]);
                            }
                            else{
                                traverse(subtree.children[2], stmt["initialization"]);
                                traverse(subtree.children[3], stmt["condition"]);
                                traverse(subtree.children[5], stmt["body"]);
                            }
                        }
                        else{
                            traverse(subtree.children[2], stmt["initialization"]);
                            traverse(subtree.children[3], stmt["condition"]);
                            traverse(subtree.children[4], stmt["incrementation"]);
                            traverse(subtree.children[6], stmt["body"]);
                        }
                    }
                    else if(first_token.lexeme === "do"){
                        traverse(subtree.children[4], stmt["condition"]);
                        traverse(subtree.children[1], stmt["body"]);
                    }
                    else if(first_token.lexeme === "while"){
                        traverse(subtree.children[2], stmt["condition"]);
                        traverse(subtree.children[4], stmt["body"]);
                    }
                    stmt_list.push(stmt);
                    break;
                case "selection_stmt":
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        },
                        "condition": [],
                        "if": [],
                        "else": []
                    };
                    if(subtree.children.length === 5){
                        traverse(subtree.children[2], stmt["condition"]);
                        traverse(subtree.children[4], stmt["if"]);
                    }
                    else{
                        traverse(subtree.children[2], stmt["condition"]);
                        traverse(subtree.children[4], stmt["if"]);
                        traverse(subtree.children[6], stmt["else"]);
                    }
                    stmt_list.push(stmt);
                    break;
                case "compound_stmt":
                    var first_token = parse_tree_helper.get_first_token(subtree, null);
                    var last_token = parse_tree_helper.get_last_token(subtree, null);
                    var stmt = {
                        "type": subtree.title,
                        "range": {
                            "start": {
                                "row": first_token.row,
                                "col": first_token.col,
                            },
                            "end": {
                                "row": last_token.row,
                                "col": last_token.col,
                            }
                        },
                        "body": []
                    };
                    if(subtree.children.length === 3){
                        traverse(subtree.children[1], stmt["body"]);
                        stmt_list.push(stmt);
                    }
                    break;
                default:
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i], stmt_list);
                    }
                    break;
            }
        }
    };

    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        var stmt_list = [];
        parse_tree_helper.add_parent_edges(parse_tree);
        traverse(parse_tree, stmt_list);
        return stmt_list;
    }
}
module.exports.get_statement_list = get_statement_list;
