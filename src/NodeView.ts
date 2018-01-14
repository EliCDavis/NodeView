import { Vector } from "./Vector";
import { Node } from "./Node";
import { Renderer } from "./rendering/Renderer";
import { RenderData } from "./rendering/RenderData";
import { NodeLink } from "./NodeLink";
import { NodeCreationOptions } from "./NodeCreationOptions";

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

    constructor(private canvasElement: HTMLCanvasElement) {

        if (!canvasElement) {
            throw new Error("Canvas Element Can Not Be Null!");
        }

        // Resize canvas so shitty stretching doesn't occur
        const resizeWindow = () => {
            canvasElement.width = canvasElement.clientWidth;
            canvasElement.height = canvasElement.clientHeight;
        }
        resizeWindow()
        window.addEventListener("resize", () => resizeWindow())

        this.context = canvasElement.getContext("2d");

        canvasElement.addEventListener("wheel", event => {
            this.zoom(event.deltaY > 0 ? 0.3 : -0.3);
        })

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
    public createNode(optionalConfig?: NodeCreationOptions): Node {
        let newNode = new Node(optionalConfig);
        this.nodes.push(newNode);
        return newNode;
    }

    /**
     * Creates a link between two arbitrary nodes
     * @param nodeA 
     * @param nodeB 
     */
    public linkNodes(nodeA: Node, nodeB: Node): NodeLink {
        return null;
    }


    private getCanvasSize(): Vector {
        return new Vector(this.canvasElement.width, this.canvasElement.height)
    }

    /**
     * Zoom in or out of the map by a certain percentage of the current zoom level
     * @param percentage positive percentage decreases scale
     */
    public zoom(percentage: number): number {
        const newScale = this.scale - (this.scale * percentage);

        const canvasSize = this.getCanvasSize()

        const oldCenter = canvasSize.scale((1.0 / this.scale) * 0.5);
        const newCenter = canvasSize.scale((1.0 / newScale) * 0.5);

        this.topLeftPosition = this.topLeftPosition.add(newCenter).subtract(oldCenter);
        this.scale = newScale;

        return this.scale;
    }

    public getScale(): number {
        return this.scale
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