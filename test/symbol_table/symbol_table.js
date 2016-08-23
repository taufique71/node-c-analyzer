var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('Symbol table', function() {
    it('Should be able to require `get_symbol_table` as a function', function () {
        var get_symbol_table = require("../../lib/symbol_table").get_symbol_table;
        assert(get_symbol_table);
        assert(typeof(get_symbol_table), "function");
    });

    it("Should return valid symbol table", function(done){
        var get_symbol_table = require("../../lib/symbol_table").get_symbol_table;
        var add_parent_edges = require("../../lib/utility").add_parent_edges;
        var file = __dirname + '/cases/case_8.json';
        jsonfile.readFile(file, function(err, obj) {
            //console.log(JSON.stringify(obj));
            get_symbol_table(obj);
            done();
        });
    });
});
