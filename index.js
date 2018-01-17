(function(exports) {
    ////////////////// constructor
    function OyaAnn() {
        var that = this;
        return that;
    }

    ///////////////// class ////////////////////
    OyaAnn.Layer = require("./src/Layer");
    OyaAnn.MapLayer = require("./src/MapLayer");
    OyaAnn.Network = require("./src/Network");
    OyaAnn.Sequential = require("./src/Sequential");
    OyaAnn.Example = require("./src/Example");
    OyaAnn.Factory = require("./src/Factory");
    OyaAnn.Equations = require("./src/Equations");
    OyaAnn.Variable = require("./src/Variable");

    module.exports = exports.OyaAnn = OyaAnn;
})(typeof exports === "object" ? exports : (exports = {}));

// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("OyaAnn", function() {
    var OyaAnn = exports.OyaAnn; // require("./OyaAnn");

})
