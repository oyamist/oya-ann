// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("Variable", function() {
    const mathjs = require("mathjs");
    const should = require("should");
    const Variable = require('../index').Variable;
    const Example = require('../index').Example;

    it("Variable(values) defines a continuous variable", function() {
        new Variable([30, 1]).should.properties({
            min: 1,
            max: 30,
        });
    })
    it("sample() returns a sample value", function() {
        var vdefault = new Variable([30, 1]);
        var vuniform = new Variable([30, 1], Variable.UNIFORM);
        var vdiscrete = new Variable([10, 20, 30], Variable.DISCRETE);

        var sPrev = null;
        vdefault.median.should.equal(31 / 2);
        for (var i = 0; i < 20; i++) {
            var s = vdefault.sample();
            s.should.not.below(vdefault.min);
            s.should.not.above(vdefault.max);
            s.should.not.equal(sPrev);
            sPrev = s;
        }
        vdefault.sample.toString().should.equal(vuniform.sample.toString());
        vuniform.median.should.equal(31 / 2);

        var s = Array(100).fill().map((v, i) => vdiscrete.sample()).sort();
        s[0].should.equal(10);
        s[mathjs.round(s.length / 2)].should.equal(20);
        vdiscrete.median.should.equal(20);
        s[s.length - 1].should.equal(30);
    });
    it("Variable([A,B],Variable.UNIFORM) create uniform variable over interval [A,B)", function() {
        var distribution = new Variable([1, 10], Variable.UNIFORM);
        var data = Array(1000).fill().map(() => distribution.sample());
        distribution.mean.should.equal(5.5);
        distribution.median.should.equal(5.5);
        distribution.min.should.equal(1);
        distribution.max.should.equal(10);
        mathjs.median(data).should.approximately(5.5, 0.5);
        mathjs.mean(data).should.approximately(5.5, 0.5);
        mathjs.std(data).should.approximately(9 / mathjs.sqrt(12), 0.5);
    });
    it("Variable([A,B],Variable.DISCRETE) create discrete variable over given values", function() {
        var distribution = new Variable([1, 2, 3, 10], Variable.DISCRETE);
        var data = Array(1000).fill().map(() => distribution.sample());
        mathjs.median(data).should.approximately(2.5, 0.5);
        mathjs.mean(data).should.approximately(4, 0.5);
        mathjs.std(data).should.approximately(4, 0.8); // by definition 
    });
    it("Variable([A,B],Variable.GAUSSIAN) create Gaussian variable with mean (A+B)/2 and stadev |A-B|", function() {
        var distribution = new Variable([1, 10], Variable.GAUSSIAN);
        var data = Array(1000).fill().map(() => distribution.sample());
        mathjs.median(data).should.approximately(5.5, 1.2);
        mathjs.mean(data).should.approximately(5.5, 1.0);
        mathjs.std(data).should.approximately(9, 0.7);

        // createGaussian is an alternate constructor
        var gauss = Variable.createGaussian(9, 5.5);
        should.deepEqual(gauss, distribution);
    });
    it("variables(examples,distributions) returns variables used in examples", function() {
        var examples = [
            new Example([0, 100, -1], [0.5]),
            new Example([1, 200, -10], [1.5]),
            new Example([2, 300, -20], [2.5]),
        ];
        should.deepEqual(Variable.variables(examples), [
            new Variable([0,1,2]),
            new Variable([100,200,300]),
            new Variable([-1,-10,-20]),
        ]);
        should.deepEqual(Variable.variables(examples,[Variable.GAUSSIAN,Variable.UNIFORM,Variable.DISCRETE]), [
            new Variable([0,1,2],Variable.GAUSSIAN),
            new Variable([100,200,300],Variable.UNIFORM),
            new Variable([-1,-10,-20],Variable.DISCRETE),
        ]);
    });
})
