var detect_namespace = function(subtree){
    if(subtree.title === "labeled_stmt") return "label";
    else if(subtree.title === "struct_or_union_specifier") return "tag";
    else if(subtree.title === "enum_specifier") return "tag";
    else if(subtree.title === "declaration") return "ordinary_id";
    else if(subtree.title === "parameter_declaration") return "ordinary_id";
    else return null;
};
module.exports.detect_namespace = detect_namespace;
