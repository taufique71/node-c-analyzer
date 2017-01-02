var _ = require("lodash");
var symbol_table_analyzer = require("../symbol_table/symbol_table");
var get_symbol_table = require("./symbol_table").get_symbol_table;

var get_call_graph = function(parse_tree){
    if(parse_tree === null){
        return {
            "Error": "Syntax Error"
        };
    }
    else{
        var graph = {
            "vertices": [],
            "edges": []
        };

        var sym_table = symbol_table_analyzer.get_symbol_table(parse_tree);
        var function_list = symbol_table_analyzer.get_function_list(sym_table);
        var function_name_map = {};
        for(var i = 0; i < function_list.length; i++){
            graph.vertices.push(function_list[i].name);
            function_name_map[function_list[i].name] = true;
        }


        // Returns true of false depending on whether querying location is enclosed
        // inside enclosing location.
        // query_loc = { row: 1, col: 2}    
        // enclosing_loc = { 
        //     start: {row: 0, col: 0}, 
        //     end: {row: 10, col: 10}
        // }
        var is_enclosed_inside = function(query_loc, enclosing_loc){
            if(query_loc.row > enclosing_loc.start.row){
                if(query_loc.row < enclosing_loc.end.row) return true;
                else if(query_loc.row > enclosing_loc.end.row) return false;
                else{
                    if(query_loc.col < enclosing_loc.end.col) return true;
                    else if(query_loc.col > enclosing_loc.end.col) return false;
                }
            }
            else if(query_loc.row < enclosing_loc.start.row) return false;
            else{
                if(query_loc.col > enclosing_loc.start.col) return true;
                else if(query_loc.col < enclosing_loc.start.col) return false;
            }
        };
        
        var is_function_call = function(postfix_expr){
            var postfix_expr_p = postfix_expr.children[1];
            if(postfix_expr_p.children[0].tokenClass){
                if(postfix_expr_p.children[0].lexeme === "(") return true;
                else return false;
            }
            else return false;
        };

        var traverse = function(subtree){
            if((subtree === null) || (subtree.title === "EPSILON") || (subtree.children === null)){
                return;
            }
            else{
                if(subtree.title === "postfix_expr"){
                    if(is_function_call(subtree)){
                        var primary_expr = subtree.children[0];
                        var identifier_name = primary_expr.children[0].lexeme;
                        var identifier_position = {
                            "row": primary_expr.children[0].row,
                            "col": primary_expr.children[0].col
                        };
                        if(function_name_map[identifier_name]){
                            for(var i =0 ; i < function_list.length; i++){
                                if(is_enclosed_inside(identifier_position, function_list[i].range)){
                                    graph.edges.push({
                                        "from": function_list[i].name,
                                        "to": identifier_name
                                    });
                                }
                            }
                        }
                    }
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
                else{
                    for(var i = 0; i < subtree.children.length; i++){
                        traverse(subtree.children[i]);
                    }
                }
            }
        };
        

        // Populate graph data structure with edges
        traverse(parse_tree);

        return graph;
    }
};
module.exports.get_call_graph = get_call_graph;
