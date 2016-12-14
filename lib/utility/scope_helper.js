var detect_scope = function(subtree){
    if( subtree.title === "translation_unit" ) return "file_scope";
    else if( subtree.title === "iteration_stmt" || subtree.title === "selection_stmt" ) return "block_scope";
    else if( subtree.title === "function_definition") return "function_scope";
};
module.exports.detect_scope = detect_scope;
