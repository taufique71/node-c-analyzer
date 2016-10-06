var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('Call graph', function() {
    it('Should be able to require `get_call_graph` as a function', function () {
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        assert(get_call_graph);
        assert(typeof(get_call_graph), "function");
    });

    it("Should return valid call graph", function(done){
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        var file = __dirname + '/cases/case_1.json';
        jsonfile.readFile(file, function(err, obj) {
            var graph = get_call_graph(obj);
            //console.log(graph);
            done();
        });
    });
    it("Should return valid call graph", function(done){
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        var file = __dirname + '/cases/case_2.json';
        jsonfile.readFile(file, function(err, obj) {
            var graph = get_call_graph(obj);
            //console.log(graph);
            done();
        });
    });
    it("Should return valid call graph", function(done){
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        var file = __dirname + '/cases/case_3.json';
        jsonfile.readFile(file, function(err, obj) {
            var graph = get_call_graph(obj);
            //console.log(graph);
            done();
        });
    });
    it("Should return valid call graph", function(done){
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        var file = __dirname + '/cases/case_4.json';
        jsonfile.readFile(file, function(err, obj) {
            var graph = get_call_graph(obj);
            //console.log(graph);
            done();
        });
    });
});
