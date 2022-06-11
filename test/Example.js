// mocha -R min --inline-diffs *.js
(typeof describe === 'function') && describe("Example", function() {
    var should = require("should");
    const { Example } = require("../index");
    it("Example.shuffle(a) permutes array", function() {
        var a = [1, 2, 3, 4, 5, 6, 7, 8];
        var b = [1, 2, 3, 4, 5, 6, 7, 8];
        Example.shuffle(b);
        should(
            a[0] !== b[0] ||
            a[1] !== b[1] ||
            a[2] !== b[2] ||
            a[3] !== b[3] ||
            a[4] !== b[4] ||
            a[5] !== b[5] ||
            a[6] !== b[6]
        ).equal(true);
        should.deepEqual(a, b.sort());
    })
})
