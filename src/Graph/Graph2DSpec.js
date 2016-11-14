
describe("Graph2D", function () {

    var canvas = document.createElement('canvas');
    var graph = new Graph2D(canvas);

    afterEach(function () {
        graph.clearNodes();
    });

    it("should be able to add nodes", function () {

        var node = graph.createNode({
            radius: 55,
            position: [30, 70]
        });

        expect(graph.getNodes()[0].getId()).toBe(node.getId());

    });

    it("should be able to link and unlink nodes and render said links", function () {

        var node = graph.createNode({
            radius: 55,
            position: [30, 70]
        });

        var node2 = graph.createNode({
            radius: 55,
            position: [10, 70]
        });

        graph.linkNodes(node, node2);
        graph.forceDrawFrame();        
        expect(graph.nodesAreLinked(node, node2)).toBe(true);

        graph.clearLinks();
        expect(graph.nodesAreLinked(node, node2)).toBe(false);

        graph.linkNodes(node, node2, {
            $directedTowards: node
        });
        graph.forceDrawFrame();
        expect(graph.nodesAreLinked(node, node2)).toBe(true);

    });

});
