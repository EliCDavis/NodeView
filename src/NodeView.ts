// MIT - Eli C Davis
import { Vector } from "./Vector";
import { Node } from "./Node";
import { Renderer } from "./rendering/Renderer";
import { RenderData } from "./rendering/RenderData";
import { NodeLink } from "./NodeLink";
import { NodeCreationOptions } from "./NodeCreationOptions";
import { InteractionManager } from "./InteractionManager";
import { ItemRenderData } from "./rendering/ItemRenderData";

export { NodeView };

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
     * Double nested dictionary that points returns index of link in the nodeLinks array so lookup
     * of links between nodes happen in O(n) time
     */
    private nodeLinkLookup: {};

    /**
     * All links between nodes
     */
    private nodeLinks: Array<NodeLink>;

    /**
     * Keeps up with any events going on inside the canvas and performs appropriate actions on the
     * view
     */
    private interactionManager: InteractionManager;

    constructor(private canvasElement: HTMLCanvasElement) {

        if (!canvasElement) {
            throw new Error("Canvas Element Can Not Be Null!");
        }

        // Resize canvas so shitty stretching doesn't occur
        const resizeWindow = () => {
            canvasElement.width = canvasElement.clientWidth;
            canvasElement.height = canvasElement.clientHeight;
        };
        resizeWindow();
        window.addEventListener("resize", () => resizeWindow())

        this.context = canvasElement.getContext("2d");

        this.scale = 1;

        this.topLeftPosition = new Vector(0, 0);

        this.nodes = new Array<Node>();
        this.nodeLinks = new Array<NodeLink>();
        this.nodeLinkLookup = {};

        this.interactionManager = new InteractionManager(
            this,
            canvasElement,
            this.getAllDataNeededForRender
        );

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
     * Creates a link between two arbitrary nodes, returns Link created. If the link existed, then
     * we overwrite the current link data with what was passed in.
     * If either of the nodes are null then we throw an error.
     * @param nodeA 
     * @param nodeB 
     */
    public linkNodes(nodeA: Node, nodeB: Node, extraData?: any): NodeLink {
        if (!nodeA || !nodeB) {
            // TODO: Throw error
            return null;
        }

        const alreadyExisting = this.getLink(nodeA, nodeB);
        if (alreadyExisting) {
            // alreadyExisting.data = extraData;
            return alreadyExisting;
        }

        // Create the link now that we know it doesn't already exist
        const newLink: NodeLink = {
            a: nodeA,
            b: nodeB,
            data: extraData
        };

        const indexOfNewEle: number = this.nodeLinks.push(newLink) - 1;

        // Store link appropriately for quick lookup..
        this.createEntryOfLinkInLookup(nodeA.getId(), nodeB.getId(), indexOfNewEle);
        this.createEntryOfLinkInLookup(nodeB.getId(), nodeA.getId(), indexOfNewEle);

        return newLink;
    }

    private createEntryOfLinkInLookup(a: string, b: string, index: number): void {
        if (this.nodeLinkLookup.hasOwnProperty(a) === false) {
            this.nodeLinkLookup[a] = {};
        }
        this.nodeLinkLookup[a][b] = index;
    }

    /**
     * Returns any data set about the link, or null if the link does not exist
     * @param nodeA 
     * @param nodeB 
     */
    public getLink(nodeA: Node, nodeB: Node): NodeLink {
        if (this.nodeLinkLookup.hasOwnProperty(nodeA.getId()) === false) {
            return null;
        }

        if (this.nodeLinkLookup[nodeA.getId()].hasOwnProperty(nodeB.getId()) === false) {
            return null;
        }

        const index: number = this.nodeLinkLookup[nodeA.getId()][nodeB.getId()];
        return index === -1 ? null : this.nodeLinks[index];
    }

    private getCanvasSize(): Vector {
        return new Vector(this.canvasElement.width, this.canvasElement.height);
    }

    /**
     * Zoom in or out of the map by a certain percentage of the current zoom level
     * @param percentage positive percentage decreases scale
     */
    public zoom(percentage: number): number {
        const newScale = this.scale - (this.scale * percentage);

        const canvasSize = this.getCanvasSize();

        const oldCenter = canvasSize.scale((1.0 / this.scale) * 0.5);
        const newCenter = canvasSize.scale((1.0 / newScale) * 0.5);

        this.topLeftPosition = this.topLeftPosition.add(newCenter).subtract(oldCenter);
        this.scale = newScale;

        return this.scale;
    }

    public getScale: () => number = () => this.scale;

    public getPosition: () => Vector = () => this.topLeftPosition;

    public setPosition(position: Vector) {
        if (!position) {
            // TODO: THROW ERROR OR SOMETHING
            return;
        }
        this.topLeftPosition = position;
    }

    /**
     * Computes all the data for rendering
     * 
     * TODO: Move to cached method where data only recomputed if certain updates have called for
     *       it...
     */
    private getAllDataNeededForRender: () => RenderData = () => {

        const convertedNodes: any = {};

        // Build all node render data
        this.nodes.forEach((node: Node) => {

            const rendered: ItemRenderData = {
                positionOnCanvas: new Vector(
                    (node.getPosition().x() + this.topLeftPosition.x()) * this.scale,
                    (node.getPosition().y() + this.topLeftPosition.y()) * this.scale),
                scale: node.getRadius() * this.scale,
                containsPoint: (data: ItemRenderData, point: Vector) => {
                    return data.positionOnCanvas.distance(point) < data.scale;
                },
                originalItem: node
            };

            convertedNodes[node.getId()] = rendered;
        });

        // Return all the node data.
        return {
            items: this.nodes.map((node: Node) => convertedNodes[node.getId()]),
            links: this.nodeLinks.map((link: NodeLink) => ({
                a: convertedNodes[link.a.getId()],
                b: convertedNodes[link.b.getId()],
                data: link.data
            }))
        };
    }

}