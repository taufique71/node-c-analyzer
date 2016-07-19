var symbol_table = function(parse_tree){
    
};
module.exports.symbol_table = symbol_table;

var get_identifier_list = function(parse_tree){
    var identifier_list = [];
    var traverse = function(subtree){
        if((subtree === null) || (subtree.title === "EPSILON")) return;
        //else if(subtree.children === null) return;
        //else{
            //if(subtree.title === "function_definition"){
                //function_definition_count += 1;
            //}
            //else if(subtree.title === "declarator"){
                //declarator_count += 1;
            //}
            //for(var i = 0; i < subtree.children.length; i++){
                //traverse(subtree.children[i]);
            //}
            //return;
        //}
    };
};
