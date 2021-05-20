var mathjs = require("mathjs");
(typeof describe === 'function') && describe("mathjs", function() {
    var should = require("should");
    var Equations = require("../src/Equations");
    var https = require("https");
    var fs = require("fs");

    const {
        ConstantNode,
        SymbolNode,
        FunctionNode,
        OperatorNode,
        ParenthesisNode,
    } = mathjs.expression && mathjs.expression.node || mathjs;

    it("TESTTESTConstantNode", ()=>{
        var node = new ConstantNode(0);
        should(node.isConstantNode).equal(true);
        should.deepEqual(Object.assign({}, node), {
            value: '0',
            valueType: 'number',
        });
    });
    it("TESTTESTSymbolNode", ()=>{
        var node = new SymbolNode("abc");
        should(node.isSymbolNode).equal(true);
        should.deepEqual(Object.assign({}, node), {
            name: 'abc',
        });
    });
    it("TESTTESTFunctionNode", ()=>{
        var n1 = new ConstantNode(1);
        var args = [n1]; // TODO
        var name = "math.pow";
        var node = new FunctionNode(name, args);
        should(node.isFunctionNode).equal(true);
        let fn = new SymbolNode(name);
        should.deepEqual(Object.assign({}, node), { fn, args });
    });
    it("TESTTESTOperatorNode", ()=>{
        var n1 = new ConstantNode(1);
        var n2 = new ConstantNode(2);
        var name = 'add';
        var args = [n1,n2];
        var op = '+';
        var node = new OperatorNode(op, name, args);
        should(node.isOperatorNode).equal(true);
        should.deepEqual(Object.assign({}, node), {
            fn: name,
            args,
            implicit: false,
            op,
        });
    });
    it("TESTTESTParenthesisNode", ()=>{
        let content = new SymbolNode('x');
        var node = new ParenthesisNode(content);
        should(node.isParenthesisNode).equal(true);
        should.deepEqual(Object.assign({}, node), { 
            content,
        });
    });

})
