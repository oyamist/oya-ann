
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
        this.timeout(15*1000);
        winston.level='debug';
        var dataFname = path.join(TESTDATA, 'sutta-length.json');
        var data = JSON.parse(fs.readFileSync(dataFname));
        var examples = data.map(d => {
            var input = [
                d.text.en, 
                //Math.log(d.text.en),
                //d.segments,
                Math.log(d.segments),
                d.tracks,
                //Math.log(d.tracks),
            ];
            var target = [
                d.elapsed/1000,
            ];
            return new Example(input, target);
        });
        //examples.sort((a,b) => a.input[0] - b.input[0]);
        //console.log(`dbg examples`, examples);
        var v = Variable.variables(examples);
        var targetCost = 100; 
        var factory = new Factory(v, {
            power: 1,
            targetCost,
            preTrain: true,
            trainingReps: 50, 
        });
        //var maxErr = 20; // initial guess
        var maxErr = 11.2; // initial guess
        var MAX_TRIALS = 10; // number of networks to generate and test
        for (var trials = MAX_TRIALS; trials-- > 0; ) {
            var network = factory.createNetwork();
            var resTrain = network.train(examples);
            should(resTrain.maxCost).below(targetCost);
            var trialErr = 0;
            for (var i = 0; i < examples.length; i++) {
                var ex = examples[i];
                var resAct = network.activate(ex.input);
                var err = resAct[0] - ex.target[0];
                var absErr = Math.abs(err);
                //console.log(`dbg ${resAct[0]} ${err}`, absErr>maxErr?"!!!":"");
                trialErr = Math.max(trialErr, absErr);
            };
            if (trialErr < maxErr) { // save best network
                var netfname = path.join(TESTDATA, 'sutta-length.network');
                fs.writeFileSync(netfname, JSON.stringify(network, null, 2));
                console.log(`saving trialErr:${trialErr} netfname:${netfname}`);
                //console.log(`dbg resTrain`, resTrain);
                maxErr = trialErr;
            }
        }
    })
})
