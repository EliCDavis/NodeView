import { Vector } from "./Vector";
import { NodeView } from "./NodeView";

export { Node };

/**
 * A single node to be rendered on the graph
 */
class Node {

    position: Vector;

    
    constructor() {
        this.position = new Vector(0, 0);
    }

    public distanceFrom(otherNode: Node) {
        throw new Error("Not implemented");
    }

    public render(view: NodeView) {
        throw new Error("Not implemented");
    }

}