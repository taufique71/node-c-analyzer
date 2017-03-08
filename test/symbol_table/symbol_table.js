var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('Symbol table', function() {
    it('Should be able to require `get_symbol_table` as a function', function () {
        var get_symbol_table = require("../../lib/symbol_table/symbol_table").get_symbol_table;
        assert(get_symbol_table);
        assert(typeof(get_symbol_table), "function");
    });

    it("Should return valid symbol table", function(done){
        var get_symbol_table = require("../../lib/symbol_table/symbol_table").get_symbol_table;
        var add_parent_edges = require("../../lib/utility/parse_tree_helper").add_parent_edges;
        var file = __dirname + '/cases/case_1.js';
        jsonfile.readFile(file, function(err, obj) {
            var symtable = get_symbol_table(obj);
            done();
        });
    });

    it("Should return valid symbol table", function(done){
        var get_symbol_table = require("../../lib/symbol_table/symbol_table").get_symbol_table;
        var add_parent_edges = require("../../lib/utility/parse_tree_helper").add_parent_edges;
        var file = __dirname + '/cases/case_2.js';
        jsonfile.readFile(file, function(err, obj) {
            var symtable = get_symbol_table(obj);
            done();
        });
    });

    it("Should return valid symbol table", function(done){
        var get_symbol_table = require("../../lib/symbol_table/symbol_table").get_symbol_table;
        var add_parent_edges = require("../../lib/utility/parse_tree_helper").add_parent_edges;
        var file = __dirname + '/cases/case_3.js';
        jsonfile.readFile(file, function(err, obj) {
            var symtable = get_symbol_table(obj);
            done();
        });
    });

    it("case_4 should have valid symbol table", function(done){
        var get_symbol_table = require("../../lib/symbol_table/symbol_table").get_symbol_table;
        var add_parent_edges = require("../../lib/utility/parse_tree_helper").add_parent_edges;
        var file = __dirname + '/cases/case_4.js';
        jsonfile.readFile(file, function(err, obj) {
            var symtable = get_symbol_table(obj);
            done();
        });
    });
});
