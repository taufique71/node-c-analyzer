# node-c-analyzer
Node module for static analysis of programs written in C programming language.
Right now it supports only single file C programs.

## What Does It Provide?
So far it can provide following information from a given source code -
* Symbol Table
* Call Graph
* Statement List

## Dependencies

For lexing purpose `node-c-lexer` is used.
Before tokenizing the source code `node-c-lexer` assumes that all preprocessors are removed. 
To remove the preprocessor it provides an API also.
If preprocessor free code is given then there is no dependency.
But if preprocessor is to be removed with `node-c-lexer` then it requires that the command`cpp` is in the PATH.

## Usage

##### Step 1
Install the module with `npm`
```
npm install node-c-analyzer
```

##### Step 2
Require the module
```js
var analyzer = require("node-c-analyzer");
```

##### Step 3
Get the lexer and parser; remove preprocessors; tokenize source code; parse token stream.
```js
var parser = analyzer.parser;
var lexer = parser.lexer;
lexer.cppUnit.clearPreprocessors("./codefile.c", function(err, codeText){
    if(err){
        res.send({"error": err});
    }
    else{
        var tokens = lexer.lexUnit.tokenize(codeText);
        var parse_tree = parser.parse(tokens);
    }
});
```

##### Step 4
Call appropriate function of appropriate analyzer with the parse tree.
```js
var symbol_table = analyzer.symbol_table_analyzer.get_symbol_table(parse_tree);
```

## Documentation
Module consists of following three analyzers -
* [`symbol_table_analyzer`](#symbol-table-analyzer)
* [`call_graph_analyzer`](#call-graph-analyzer)
* [`statement_analyzer`](#statement-analyzer)
#### Symbol Table Analyzer
Available API list -
* `get_symbol_table`
    * *Argument*: Parse tree
    * *Returns*: JSON containing details information about all the symbols used in the program
* `get_scope_list`
    * *Argument*: Symbol table
    * *Returns*: JSON containing all the scopes as key value pair; where key is stringified name of the scope.
* `get_function_list`
    * *Argument*: Symbol table
    * *Returns*: JSON array containing information about functions
#### Call Graph Analyzer
Available API list -
* `get_call_graph`
    * *Argument*: Parse tree
#### Statement Analyzer
Available API list -
* `get_statement_list`
    * *Argument*: Parse tree
