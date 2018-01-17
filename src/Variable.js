var mathjs = require("mathjs");

(function(exports) {

    // CLASS
    class Variable {
        constructor (values, distribution = Variable.UNIFORM) {
            var that = this;
            that.max = mathjs.max(values);
            that.min = mathjs.min(values);
            that.values = Object.assign([], values);
            that.distribution = distribution;
            if (distribution === Variable.UNIFORM) {
                that.sample = Variable.prototype.sampleUniform;
                that.mean = that.median = (that.min + that.max) / 2;
            } else if (distribution === Variable.DISCRETE) {
                that.sample = Variable.prototype.sampleDiscrete;
                that.median = mathjs.median(that.values);
                that.mean = mathjs.mean(that.values);
            } else if (distribution === Variable.GAUSSIAN) {
                that.sample = Variable.prototype.sampleGaussian;
                that.median = (that.min + that.max) / 2;
                that.sigma = that.max - that.min;
                that.data = [];
            } else {
                throw new Error("Variable has unknown distribution:" + distribution);
            }
            return that;
        }
        static variables(examples, distributions=[]) {
            if (!(examples instanceof Array) || examples.length === 0) {
                throw new Error("Expected array of Example");
            }
            var values = examples.reduce((a,e) => {
                e.input.forEach((iv,i) => {
                    if (a[i] == null) {
                        a[i] = [];
                    }
                    a[i].push(iv);
                });
                return a;
            }, []);
            return values.map((v,i) => new Variable(v, distributions[i]));
        }
        sampleUniform() {
            var that = this;
            return mathjs.random(that.min, that.max);
        }
        sampleDiscrete() {
            var that = this;
            return mathjs.pickRandom(that.values);
        }
        sampleGaussian() {
            var that = this;
            if (that.data.length === 0) {
                var N = 25;
                for (var i = N; i-- > 0;) { // generate N*2 numbers
                    do {
                        var x1 = 2.0 * mathjs.random() - 1.0;
                        var x2 = 2.0 * mathjs.random() - 1.0;
                        var w = x1 * x1 + x2 * x2;
                    } while (w >= 1.0);
                    w = mathjs.sqrt((-2.0 * mathjs.log(w)) / w);
                    that.data.push(x1 * w * that.sigma + that.median);
                    that.data.push(x2 * w * that.sigma + that.median);
                }
            }
            return that.data.pop();
        }
    }

    ///// CLASS
    Variable.createGaussian = function(stdDev = 1, mean = 0) {
        var sd2 = stdDev / 2;
        return new Variable([mean - sd2, mean + sd2], Variable.GAUSSIAN);
    }
    Variable.UNIFORM = "uniform";
    Variable.DISCRETE = "discrete";
    Variable.GAUSSIAN = "gaussian";

    module.exports = exports.Variable = Variable;
})(typeof exports === "object" ? exports : (exports = {}));
