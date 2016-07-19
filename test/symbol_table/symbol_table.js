var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('variable_count', function() {
    it('Should be able to require `variable_count` as a function', function () {
        var variable_count = require("../../lib/symbol_table").symbol_table;
        assert(variable_count);
        assert(typeof(variable_count), "function");
    });

    it("Should have 0 variables", function(done){
        var variable_count = require("../../lib/symbol_table").symbol_table;
        var add_parent_edges = require("../../lib/utility").add_parent_edges;
        var file = __dirname + '/cases/case_1.json';
        jsonfile.readFile(file, function(err, obj) {
            add_parent_edges(obj);
            done();
        });
    });
});
