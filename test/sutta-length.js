
// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("sutta-length", function() {
    const winston = require('winston');
    const fs = require('fs');
    const path = require('path');
    const mathjs = require("mathjs");
    const OyaAnn = require("../index");
    const should = require("should");
    const Factory = OyaAnn.Factory;
    const Network = OyaAnn.Network;
    const Example = OyaAnn.Example;
    const Variable = OyaAnn.Variable;
    const TESTDATA = path.join(__dirname, 'data');
    var MapLayer = OyaAnn.MapLayer;

    it("TESTTESTOyaAnn can estimate sutta length (MAY FAIL)", function() {
        this.timeout(5*1000);
        winston.level='debug';
        var dataFname = path.join(TESTDATA, 'sutta-length.json');
        var data = JSON.parse(fs.readFileSync(dataFname));
        var examples = data.map(d => {
            var input = [
                d.text.en, 
                Math.log(d.text.en),
                d.segments,
                d.tracks,
            ];
            var target = [
                d.elapsed/1000,
            ];
            return new Example(input, target);
        });
        //examples.sort((a,b) => a.input[0] - b.input[0]);
        //console.log(`dbg examples`, examples);
        var v = Variable.variables(examples);
        var targetCost = 10; 
        var factory = new Factory(v, {
            power: 1,
            targetCost,
            preTrain: true,
            trainingReps: 50, 
        });
        var network = factory.createNetwork();
        var resTrain = network.train(examples);
        should(resTrain.maxCost).below(targetCost);
        var maxErr = 0;
        for (var i = 0; i < examples.length; i++) {
            var ex = examples[i];
            var resAct = network.activate(ex.input);
            var err = resAct[0] - ex.target[0];
            maxErr = Math.max(maxErr, err);
        };
        if (maxErr < 0.67) { // save best network
            var netfname = path.join(TESTDATA, 'sutta-length.network');
            fs.writeFileSync(netfname, JSON.stringify(network, null, 2));
            console.log(`dbg maxErr:${maxErr} netfname:${netfname}`);
            console.log(`dbg resTrain`, resTrain);
        }
    })
})
