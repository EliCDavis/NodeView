
describe("Node2D", function () {

    var canvas = document.createElement('canvas');
    var graph = new Graph2D(canvas);
    var node = graph.createNode({
        radius: 55,
        position: [30, 70]
    });

    it("should have radius set", function () {
        expect(node.getRadius()).toBe(55);
    });

    it("should have position set", function () {
        expect(node.getPosition()[0]).toBe(30);
        expect(node.getPosition()[1]).toBe(70);
    });

});
