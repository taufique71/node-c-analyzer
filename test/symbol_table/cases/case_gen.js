var parser = require("node-c-parser");
var lexer = parser.lexer;
var fs = require("fs");
var jsonfile = require("jsonfile");
jsonfile.spaces = 2;

var code_file           =   __dirname + "/case_4.c";
var parse_tree_file     =   __dirname + "/case_4.js";

lexer.cppUnit.clearPreprocessors(code_file, function (err, code_text) {
    if (err) {
        return console.log(err);
    }
    else{
        var tokens = lexer.lexUnit.tokenize(code_text);
        var parse_tree = parser.parse(tokens);
        jsonfile.writeFile(parse_tree_file, parse_tree, function (err) {
            if(err){
                console.log(err);
            }
		});
    }
});
