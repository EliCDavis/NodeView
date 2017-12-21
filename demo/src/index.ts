import { NodeView } from "../../src";

let view: NodeView = new NodeView(document.getElementById('nodeview') as HTMLCanvasElement);

view.createNode();