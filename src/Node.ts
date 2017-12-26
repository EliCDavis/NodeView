import { Vector } from "./Vector";
import { NodeView } from "./NodeView";
import { GenerateUUID } from "./util";

export { Node };

/**
 * A single node to be rendered on the graph
 */
class Node {

    private position: Vector;

    private radius: number;

    private id: string;
    
    constructor() {
        this.position = new Vector(0, 0);
        
        // TODO: Store magic numbers like this in a defaults file
        this.radius = 50;

        // TODO: Figure out better method for generating ID..
        this.id = GenerateUUID();
    }

    public distanceFrom(otherNode: Node) {
        throw new Error("Not implemented");
    }

    public render(view: NodeView) {
        throw new Error("Not implemented");
    }

    public getRadius(): number {
        return this.radius
    }

    public getId(): string {
        return this.id;
    }

    public getPosition(): Vector {
        return this.position;
    }

}