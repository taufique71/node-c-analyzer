var get_identifier_list = function(parse_tree){
    var identifier_list = [];
    var traverse = function(subtree){
        if((subtree.tokenClass) && (subtree.tokenClass === "IDENTIFIER")){
            identifier_list.push(
                {
                    "lexeme": subtree.lexeme,
                    "row": subtree.row,
                    "col": subtree.col
                }
            );
        }
        if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
            return;
        }
        for(var i = 0; i < subtree.children.length; i++){
            traverse(subtree.children[i]);
        }
    };
    traverse(parse_tree);
    return identifier_list;
};

var symbol_table = function(parse_tree){
    return get_identifier_list(parse_tree);
};
module.exports.symbol_table = symbol_table;
