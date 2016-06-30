var assert = require("chai").assert;
var expect = require("chai").expect;
var jsonfile = require("jsonfile");

describe('variable_count', function() {
    it('Should be able to require `variable_count` as a function', function () {
        var variable_count = require("../../lib/variable_count").variable_count;
        assert(variable_count);
        assert(typeof(variable_count), "function");
    });

    it("Should have 0 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_1.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(0);
            done();
        });
    });

    it("Should have 0 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_2.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(0);
            done();
        });
    });

    it("Should have 1 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_3.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(1);
            done();
            //assert.strictEqual(n, 0);
        });
    });
    it("Should have 3 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_4.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(3);
            done();
        });
    });
    it("Should have 3 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_5.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(3);
            done();
        });
    });
    it("Should have 2 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_6.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(2);
            done();
        });
    });
    it("Should have 3 variables", function(done){
        var variable_count = require("../../lib/variable_count").variable_count;
        var file = __dirname + '/cases/case_7.json';
        jsonfile.readFile(file, function(err, obj) {
            var n = variable_count(obj);
            expect(n).to.equal(3);
            done();
        });
    });
});
