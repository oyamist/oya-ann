
// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("Factory", function() {
    const winston = require('winston');
    const mathjs = require("mathjs");
    const OyaAnn = require("../index");
    const should = require("should");
    const Factory = OyaAnn.Factory;
    const Network = OyaAnn.Network;
    const Example = OyaAnn.Example;
    const Variable = OyaAnn.Variable;
    const fs = require('fs');
    const path = require('path');
    var MapLayer = OyaAnn.MapLayer;
    var testVars = [
        new Variable([3, 300]),
        new Variable([2, 200]),
        new Variable([1, 10]),
    ];

    function vassertEqual(vactual, vexpected, tol = .001) {
        vactual.map((xa, i) => xa.should.approximately(vexpected[i], tol));
    }

    it("Factory(vars, options) creates Factory kinematic model", function() {
        var factory = new Factory(testVars, {
            nOut: 2,
        });
        should.deepEqual(factory.vars, testVars);
        factory.should.properties({
            nIn: 3,
            nOut: 2,
        })
    })
    it("examples returns pre-training examples", function() {
        var factory = new Factory(testVars);
        should.deepEqual(factory.createExamples(), [
            new Example([3, 2, 1], [3, 2, 1]), // minPos
            new Example([300, 200, 10], [300, 200, 10]), // maxPos
            new Example([303 / 2, 202 / 2, 11 / 2], [303 / 2, 202 / 2, 11 / 2]), // middle pos
            new Example([3, 200, 10], [3, 200, 10]), // maxPos neighbor
            new Example([300, 2, 1], [300, 2, 1]), // minPos neighbor
            new Example([300, 2, 10], [300, 2, 10]), // maxPos neighbor
            new Example([3, 200, 1], [3, 200, 1]), // minPos neighbor
            new Example([300, 200, 1], [300, 200, 1]), // maxPos neighbor
            new Example([3, 2, 10], [3, 2, 10]), // minPos neighbor
        ]);

        // factory can create networks with different number of outputs
        var factory = new Factory(testVars, {
            nOut: 2,
        });
        var examples = factory.createExamples();
        should.deepEqual(examples[0],
            new Example([3, 2, 1], [3, 2]) // minPos
        );
        should.deepEqual(factory.createExamples(), [
            new Example([3, 2, 1], [3, 2]), // minPos
            new Example([300, 200, 10], [300, 200]), // maxPos
            new Example([303 / 2, 202 / 2, 11 / 2], [303 / 2, 202 / 2]), // middle pos
            new Example([3, 200, 10], [3, 200]), // maxPos neighbor
            new Example([300, 2, 1], [300, 2]), // minPos neighbor
            new Example([300, 2, 10], [300, 2]), // maxPos neighbor
            new Example([3, 200, 1], [3, 200]), // minPos neighbor
            new Example([300, 200, 1], [300, 200]), // maxPos neighbor
            new Example([3, 2, 10], [3, 2]), // minPos neighbor
        ]);
    });
    it("createExamples(options?) creates training examples", function() {
        var factory = new Factory(testVars);

        function testExamples(examples, f, tol = .001) {
            examples.map((ex) => {
                ex.target.map((x, i) => x.should.approximately(f(ex.input[i]), tol));
            });
            examples.length.should.equal(9);
        }
        testExamples(factory.createExamples(), (x) => x); // default is identity
        testExamples(factory.createExamples({
            transform: (data) => data
        }), (x) => x); // transform is identity
        testExamples(factory.createExamples({
            transform: (data) => data.map((x) => 2 * x)
        }), (x) => 2 * x); // transform is scale by 2
        testExamples(factory.createExamples({
            transform: (data) => data.map((x) => -x)
        }), (x) => -x); // transform is negative
    })
    it("createNetwork() can create a linear OyaAnn neural network for identity transform", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var network = factory.createNetwork({
            power: 1
        });

        network.nIn.should.equal(3);
        network.nOut.should.equal(3);
        network.layers.length.should.equal(2);
        should.deepEqual(network.layers[0].expressions(["x0", "x1", "x2"]), [
            "x0", // linear feed-forward inputs
            "x1", // linear feed-forward inputs
            "x2", // linear feed-forward inputs
        ]);

        network.fNormIn[0](3).should.equal(-1);
        network.fNormIn[0](300).should.equal(1);
        network.fNormIn[1](2).should.equal(-1);
        network.fNormIn[1](200).should.equal(1);
        network.fNormIn[2](1).should.equal(-1);
        network.fNormIn[2](10).should.equal(1);
        vassertEqual(network.activate([300, 200, 10]), [300, 200, 10]);
        vassertEqual(network.activate([3, 2, 1]), [3, 2, 1]);
    })
    it("createNetwork() can create a linear OyaAnn neural network for negative transform", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var network = factory.createNetwork({
            transform: (data) => data.map((x) => -x)
        });
        vassertEqual(network.activate([300, 200, 10]), [-300, -200, -10]);
    })
    it("createNetwork() returns training results", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var result = {};
        var network = factory.createNetwork({
            onTrain: (r) => (result = r),
        });
        result.targetCost.should.equal(0.00000025); // cost = (tolerance ^ 2)/4
        result.epochs.should.below(100); // training should converge quickly
        result.learningRate.should.below(0.5); // learningRate is typically ~0.15
    })
    it("createNetwork(options) can create a polynomial OyaAnn neural network", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var network = factory.createNetwork({
            power: 3, // cubic polynomial
            preTrain: false,
        });

        network.nOut.should.equal(3);
        network.layers[0].nOut.should.equal(9);
        network.layers.length.should.equal(2);
        should.deepEqual(network.layers[0].expressions(["x0", "x1", "x2"]), [
            "x0", // linear feed-forward inputs
            "x1", // linear feed-forward inputs
            "x2", // linear feed-forward inputs
            "(x0^2)", // polynomial feed-forward inputs
            "(x0^3)", // polynomial feed-forward inputs
            "(x1^2)", // polynomial feed-forward inputs
            "(x1^3)", // polynomial feed-forward inputs
            "(x2^2)", // polynomial feed-forward inputs
            "(x2^3)", // polynomial feed-forward inputs
        ]);
    })
    it("createNetwork(options) can create a Fourier OyaAnn neural network", function() {
        this.timeout(10 * 1000);
        var factory = new Factory(testVars);
        var network = factory.createNetwork({
            fourier: 2, // number of fourier terms
            preTrain: false,
        });

        network.nOut.should.equal(3);
        network.layers[0].nOut.should.equal(9);
        network.layers.length.should.equal(2);
        should.deepEqual(network.layers[0].expressions(["x0", "x1", "x2"]), [
            "x0", // linear feed-forward inputs
            "x1", // linear feed-forward inputs
            "x2", // linear feed-forward inputs
            "(sin((x0*w0x0f+w0x0p1)))", // fourier feed-forward inputs
            "(sin((x0*(2*w0x0f)+w0x0p2)))", // fourier feed-forward inputs
            "(sin((x1*w0x1f+w0x1p1)))", // fourier feed-forward inputs
            "(sin((x1*(2*w0x1f)+w0x1p2)))", // fourier feed-forward inputs
            "(sin((x2*w0x2f+w0x2p1)))", // fourier feed-forward inputs
            "(sin((x2*(2*w0x2f)+w0x2p2)))", // fourier feed-forward inputs
        ]);
        network.initialize();
        network.weights.should.properties({
            "w0x0f": 1,
            "w0x0p1": 0,
            "w0x1f": 1,
            "w0x1p1": 0,
            "w0x2f": 1,
            "w0x2p1": 0,
        });
        Object.keys(network.weights).length.should.equal(39); // that's a lot of weights
        //console.log("grad:", network.costGradientExpr());
        //console.log("activate", network.memoActivate.toString());
        //console.log("propagate", network.memoPropagate.toString());
    })
    it("createNetwork(options) can create ANN with adaptive functions", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var fmap = [ // function map for hidden MapLayer
            factory.mapIdentity(0), // non-adaptive identity default: input[0]
            factory.mapPower(1, 2), // non-adaptive quadratic: input[1]^2
            factory.mapSigmoid(2, "w0r2"), // adaptive sigmoid: tanh(input[2]*w0r2)    
        ]
        var network = factory.createNetwork({
            fmap: fmap,
            mapWeights: {
                w0r2: 3,
            },
            preTrain: false,
        });

        network.nOut.should.equal(3);
        network.layers[0].nOut.should.equal(3);
        network.layers.length.should.equal(2);
        should.deepEqual(network.layers[0].expressions(["x0", "x1", "x2"]), [
            "x0", // linear feed-forward input
            "(x1^2)", // non-linear feed-forward input
            "tanh(x2*w0r2)", // non-linear feed-forward input
        ]);
        var gradC = network.costGradientExpr();
        gradC.w0r2.length.should.equal(345);
    })
    it("pre-trained quadratic OyaAnn neural network is accurate to +/-0.001", function() {
        this.timeout(60 * 1000);

        var xyza = [
            new Variable([0, 300]), // x-axis
            new Variable([0, 200]), // y-axis
            new Variable([0, 10]), // z-axis
            new Variable([0, 360]), // a-axis
        ];
        var factory = new Factory(xyza, {
            power: 2
        });
        var network = factory.createNetwork();

        var tolerance = 0.001;

        function testCoord(coord) {
            var output = network.activate(coord);
            output.map((y, i) => y.should.approximately(coord[i], tolerance));
        }
        testCoord([0, 0, 0, 0]);
        testCoord([300, 200, 10, 360]);
        testCoord([10, 20, 5, 270]);
        testCoord([75, 50, 5, 45]);
        testCoord([277, 75, 8, 190]);
    })
    it("pre-trained linear OyaAnn neural network is accurate to +/-0.001", function() {
        this.timeout(60 * 1000);

        var xyza = [
            new Variable([0, 300]), // x-axis
            new Variable([0, 200]), // y-axis
            new Variable([0, 10]), // z-axis
            new Variable([0, 360]), // a-axis
        ];
        var factory = new Factory(xyza);
        var network = factory.createNetwork();

        var tolerance = 0.001;

        function testCoord(coord) {
            var output = network.activate(coord);
            output.map((y, i) => y.should.approximately(coord[i], tolerance));
        }
        testCoord([0, 0, 0, 0]);
        testCoord([300, 200, 10, 360]);
        testCoord([10, 20, 5, 270]);
        testCoord([75, 50, 5, 45]);
        testCoord([277, 75, 8, 190]);
    })
    it("inverseNetwork(network) returns inverse of network for invertible function (MAY FAIL)", function() {
        this.timeout(60 * 1000);
        var factory = new Factory(testVars);
        var network = factory.createNetwork({ // original network adds 1
            transform: (data) => data.map((x) => 1 + x) // output = input + 1
        });

        var result;
        var examples;
        var invNetwork = factory.inverseNetwork(network, { // inverse network should subtract 1
            onTrain: (r) => (result = r),
            onExamples: (eg) => (examples = eg),
        });

        result.epochs.should.below(100); // convergence
        examples.length.should.equal(152);
        vassertEqual(invNetwork.activate([4, 3, 2]), [3, 2, 1]);
        vassertEqual(invNetwork.activate([301, 201, 11]), [300, 200, 10]);
        vassertEqual(invNetwork.activate([43, 27, 9]), [42, 26, 8], 0.002);
        vassertEqual(invNetwork.activate([275, 17, 2]), [274, 16, 1], 0.002);
    })
    it("Train OyaAnn network to correct Y-axis skew", function() {
        this.timeout(60 * 1000);

        var xyza = [
            new Variable([0, 300]), // x-axis
            new Variable([0, 200]), // y-axis
            new Variable([0, 10]), // z-axis
            new Variable([0, 360]), // a-axis
        ];
        var factory = new Factory(xyza);

        // calibration requires a network trained to model actual machine positions
        var measuredNet = factory.createNetwork({
            nRandom: 15,
            outline: false,
            transform: (expected) => { // return measured position
                var yskew = 30;
                return [ // simulate measurement of machine with 30-degree y-skew
                    expected[0] + expected[1] * mathjs.sin(yskew * mathjs.pi / 180), // x
                    expected[1] * mathjs.cos(yskew * mathjs.pi / 180), // y
                    expected[2], // z
                    expected[3], // a
                ]
            }
        });
        vassertEqual(measuredNet.activate([0, 0, 0, 0]), [0, 0, 0, 0]);
        vassertEqual(measuredNet.activate([300, 200, 10, 360]), [400, 173.205, 10, 360]);

        // we lose a bit of accuracy when activating non-examples
        var tolerance = 0.002;
        vassertEqual(measuredNet.activate([10, 10, 10, 10]), [15, 8.66, 10, 10], tolerance);

        // the calibrated network is the inverse of the measured network
        var calibratedNet = factory.inverseNetwork(measuredNet);
        vassertEqual(calibratedNet.activate([300, 200, 10, 360]), [184.530, 230.94, 10, 360], tolerance);
        vassertEqual(calibratedNet.activate([10, 10, 10, 10]), [4.227, 11.547, 10, 10], tolerance);
        vassertEqual(measuredNet.activate(calibratedNet.activate([0, 0, 0, 0])), [0, 0, 0, 0], tolerance);
        vassertEqual(measuredNet.activate(calibratedNet.activate([300, 200, 10, 0])), [300, 200, 10, 0], tolerance);
        //console.log("mathjs", JSON.stringify(measuredNet.gradExpr, null, "  "))
    })
    it("MapLayer can do linear regression", function() {
        var verbose = false;
        var exprs = [(eIn) => "(x0*slope+offset)"];
        var map = new MapLayer(exprs, {
            weights: {
                slope: 0,
                offset: 0,
            }
        });
        var vars = [new Variable([0, 200])]; // univariate
        var factory = new Factory(vars);
        var knn = factory.createNetwork({
            layers: [map],
        });
        var examples = [0, 100, 200].map((x) => new Example([x], [3 * x + 4]));
        var trainResult = knn.train(examples, {
            onEpoch: (result) => verbose && result.epochs % 10 === 0 &&
                console.log("onEpoch", JSON.stringify(result)),
        });
        verbose && console.log("trainResult", trainResult);
        verbose && console.log("weights", knn.weights);
        knn.activate([75])[0].should.approximately(229, 0.002);
        knn.activate([175])[0].should.approximately(529, 0.005);
    });
    it("OyaAnn can approximate unknown f(x)", function() {
        this.timeout(3*1000);
        //winston.level='debug';
        var refExample = new Example([25],[1413]);

        // for best results, we calibrate to the
        // actual temperatures we expect to see
        var examples = [
            //new Example([5],[896]), // too cold for nutrient
            new Example([10],[1020]),
            new Example([15],[1147]),
            new Example([20],[1278]),
            refExample,
            new Example([30],[1548]),
            new Example([35],[1711]), 
            //new Example([40],[1860]), // too hot for nutrient
            //new Example([45],[2009]), // too hot for nutrient
            //new Example([50],[2158]), // too hot for nutrient
        ];
        var v = Variable.variables(examples);
        var maxMSE = 1;
        var factory = new Factory(v, {
            power: 5,
            maxMSE,
            preTrain: true,
            trainingReps: 50, // max reps to reach maxMSE
        });
        var network = factory.createNetwork();
        network.train(examples);

        // IMPORTANT: by re-training the network once more on the
        // reference example, we minimize the error 
        // at the reference temperature
        network.train([refExample]);
        var refOut = network.activate(refExample.input);
        should(Math.abs(refOut[0] - refExample.target[0])).below(0.001);

        // The mean squared error will distribute to the other temperatures
        var mse = network.mse(examples);
        winston.debug('mse', mse);

        var json = network.toJSON();
        fs.writeFileSync(path.join(__dirname, 'data', 'ec-comp.json'), JSON.stringify(json,null,2));
        var msStart = Date.now();
        var network = Network.fromJSON(json);
        examples.forEach(e => {
            var output = network.activate(e.input);
            winston.debug('output', e.input, output, e.target, (output[0]-e.target[0]).toFixed(2));
        });
        var mse = network.mse(examples);
        should(mse).below(maxMSE);
        var msElapsed = Date.now() - msStart;
        should(msElapsed).below(100);
    })
})
