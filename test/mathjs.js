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

    const MATH3 = mathjs.version.startsWith('3');

    it("TESTTESTConstantNode", ()=>{
        var node = new ConstantNode(0);
        should(node.isConstantNode).equal(true);
        if (MATH3) {
            should.deepEqual(Object.assign({}, node), {
                value: '0',
                valueType: 'number',
            });
        } else {
            should.deepEqual(Object.assign({}, node), {
                value: 0,
            });
        }
    });
    it("SymbolNode", ()=>{
        var node = new SymbolNode("abc");
        should(node.isSymbolNode).equal(true);
        should.deepEqual(Object.assign({}, node), {
            name: 'abc',
        });
    });
    it("FunctionNode", ()=>{
        var n2 = new ConstantNode(2);
        var n3 = new ConstantNode(3);
        var n8 = new ConstantNode(8);
        var args = [n2,n3]; // TODO
        var name = "pow";
        var node = new FunctionNode(name, args);
        let code = node.compile();
        let eval = (code.eval || code.evaluate);
        //console.log(`dbg FunctionNode eval`, eval.toString());
        let ans = eval();
        should(ans).equal(8);
        /*
        should.deepEqual(JSON.parse(JSON.stringify(node)), {
            fn: { name: "pow" },
            args: [{
                value: "2",
                valueType: "number",
            },{
                value: "3",
                valueType: "number",
            }],
        });
        should(node.isFunctionNode).equal(true);
        let fn = new SymbolNode(name);
        should.deepEqual(Object.assign({}, node), { fn, args });
        */
    });
    it("parse() pow", ()=>{
        let expr = "pow(2,3)";
        let node = mathjs.parse(expr);
        console.log(`dbg node`, JSON.stringify(node));
        // NEW
        // {"mathjs":"FunctionNode","fn":{"mathjs":"SymbolNode","name":"pow"},"args":[{"mathjs":"ConstantNode","value":2},{"mathjs":"ConstantNode","value":3}]}

        // OLD
        // {"fn":{"name":"pow"},"args":[{"value":"2","valueType":"number"},{"value":"3","valueType":"number"}],"comment":""}

        should(node.isFunctionNode).equal(true);
        let code = node.compile();
        let eval = (code.eval || code.evaluate);
        //console.log(`dbg eval`, eval.toString());
        should(eval()).equal(8);
    });
    it("parse() exp", ()=>{
        let expr = "exp(2)";
        let node = mathjs.parse(expr);
        console.log(`dbg node`, JSON.stringify(node));
        // NEW
        // {"mathjs":"FunctionNode","fn":{"mathjs":"SymbolNode","name":"exp"},"args":[{"mathjs":"ConstantNode","value":2}]}

        // OLD
        // {"fn":{"name":"exp"},"args":[{"value":"2","valueType":"number"}],"comment":""}

        should(node.isFunctionNode).equal(true);
        let code = node.compile();
        let eval = (code.eval || code.evaluate);
        //console.log(`dbg eval`, eval.toString());
        should(eval()).equal(7.38905609893065);
    });
    it("OperatorNode", ()=>{
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
    it("ParenthesisNode", ()=>{
        let content = new SymbolNode('x');
        var node = new ParenthesisNode(content);
        should(node.isParenthesisNode).equal(true);
        should.deepEqual(Object.assign({}, node), { 
            content,
        });
    });

})
