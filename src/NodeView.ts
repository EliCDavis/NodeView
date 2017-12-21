import { Vector } from "./Vector";
import { Node } from "./Node";
import { Renderer } from "./Renderer";
import { RenderData } from "./RenderData";
import { NodeLink } from "./NodeLink";

export { NodeView }

class NodeView {

    private context: CanvasRenderingContext2D;

    private scale: number;

    private topLeftPosition: Vector;

    private lastSeenMousePosition: Vector;

    private renderer: Renderer;

    /**
     * All nodes that have been added to the graph
     */
    private nodes: Array<Node>;

    /**
     * All links between nodes
     */
    private nodeLinks: Array<NodeLink>;

    constructor(canvasElement: HTMLCanvasElement) {

        if (!canvasElement) {
            throw new Error("Canvas Element Can Not Be Null!");
        }

        this.context = canvasElement.getContext("2d");

        this.nodes = new Array<Node>();

        this.renderer = new Renderer(this, this.context, this.getAllDataNeededForRender);
        this.renderer.start();
    }

    /**
     * Creates a node and adds it to the graph.
     */
    public createNode(): Node {
        let newNode = new Node();
        this.nodes.push(newNode);
        return newNode;
    }

    /**
     * Computes all the data for rendering
     */
    private getAllDataNeededForRender: () => RenderData = () => ({
        nodes: this.nodes.map((node: Node)=>({positionOnCanvas: new Vector(0,0)})),
        links: this.nodeLinks
    })

}