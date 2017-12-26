import { NodeView, Node, Vector, NodeLink } from "../../src";

let view: NodeView = new NodeView(document.getElementById('nodeview') as HTMLCanvasElement);

const nodes: Array<Node> = new Array<Node>();

nodes.push(view.createNode({
    position: new Vector(100, 100)
}));

nodes.push(view.createNode({
    position: new Vector(300, 100)
}));

const link: NodeLink = view.linkNodes(nodes[0], nodes[1]);
