var add_parent_edges = function(parse_tree){
    parse_tree["parent"] = null;
    var traverse = function(subtree){
        if(subtree === null) return;
        if(!subtree.children){
            subtree.children = [];
        }
        for(var i = 0; i < subtree.children.length; i++){
            subtree.children[i]["parent"] = subtree;
            traverse(subtree.children[i]);
        }
    };
    traverse(parse_tree);
};
module.exports.add_parent_edges = add_parent_edges;
