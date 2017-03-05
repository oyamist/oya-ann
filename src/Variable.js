var mathjs = require("mathjs");

(function(exports) {

    // CLASS
    function Variable(values, distribution=Variable.UNIFORM) {
        var that = this;
        that.max = mathjs.max(values);
        that.min = mathjs.min(values);
        that.values = Object.assign([], values);
        that.distribution = distribution;
        if (distribution === Variable.UNIFORM) {
            that.sample = Variable.prototype.sampleUniform;
            that.median = (that.min+that.max)/2;
        } else if (distribution === Variable.DISCRETE) {
            that.sample = Variable.prototype.sampleDiscrete;
            that.median = that.values.sort()[mathjs.round((values.length-1)/2)];
        } else {
            throw new Error("Variable has unknown distribution:"+distribution);
        }
        return that;
    }
    Variable.prototype.sampleUniform = function() {
        var that = this;
        return mathjs.random(that.min, that.max);
    }
    Variable.prototype.sampleDiscrete = function() {
        var that = this;
        return mathjs.pickRandom(that.values);
    }
    Variable.UNIFORM = "uniform";
    Variable.DISCRETE = "discrete";
    
    module.exports = exports.Variable = Variable;
})(typeof exports === "object" ? exports : (exports = {}));

// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("Variable", function() {
    var should = require("should");
    var Variable = exports.Variable;

    it("Variable(values) defines a continuous variable", function() {
        new Variable([30,1]).should.properties({
            min: 1,
            max: 30,
        });
    })
    it("sample() returns a sample value", function() {
        var vdefault = new Variable([30,1]);
        var vuniform = new Variable([30,1], Variable.UNIFORM);
        var vdiscrete = new Variable([10,20,30], Variable.DISCRETE);

        var sPrev = null;
        vdefault.median.should.equal(31/2);
        for (var i=0; i<20; i++) {
            var s = vdefault.sample();
            s.should.not.below(vdefault.min);
            s.should.not.above(vdefault.max);
            s.should.not.equal(sPrev);
            sPrev = s;
        }
        vdefault.sample.toString().should.equal(vuniform.sample.toString());
        vuniform.median.should.equal(31/2);

        var s = Array(100).fill().map((v,i) => vdiscrete.sample()).sort();
        s[0].should.equal(10);
        s[mathjs.round(s.length/2)].should.equal(20);
        vdiscrete.median.should.equal(20);
        s[s.length-1].should.equal(30);
    });
})