var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('Call graph', function() {
    it('Should be able to require `get_call_graph` as a function', function () {
        var get_call_graph = require("../../lib/call_graph").get_call_graph;
        assert(get_call_graph);
        assert(typeof(get_call_graph), "function");
    });
});
