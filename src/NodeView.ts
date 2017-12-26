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

        canvasElement.style.width = (canvasElement.width) + "px";
        canvasElement.style.height = (canvasElement.height) + "px"

        this.context = canvasElement.getContext("2d");

        this.scale = 1;

        this.topLeftPosition = new Vector(0, 0);

        this.nodes = new Array<Node>();
        this.nodeLinks = new Array<NodeLink>();

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
     * 
     * TODO: Move to cached method where data only recomputed if
     *       certain updates have called for it...
     */
    private getAllDataNeededForRender: () => RenderData = () => {

        const convertedNodes = {};

        // Build all node render data
        this.nodes.forEach((node: Node) => {
            convertedNodes[node.getId()] = {
                positionOnCanvas: new Vector(
                    (node.getPosition().x() + this.topLeftPosition.x()) * this.scale,
                    (node.getPosition().y() + this.topLeftPosition.y()) * this.scale),
                scale: node.getRadius() * this.scale
            };
        });

        // Return all the node data.
        return {
            nodes: this.nodes.map((node: Node) => convertedNodes[node.getId()]),
            links: this.nodeLinks.map((link: NodeLink) => ({
                a: convertedNodes[link.a.getId()],
                b: convertedNodes[link.b.getId()],
                data: link.data
            }))
        }
    }

}