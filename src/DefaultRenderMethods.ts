import { RenderMethods } from "./RenderMethods";
import { NodeView } from "./NodeView";
import { Node } from "./Node";
import { NodeRenderData } from "./NodeRenderData";


export { defaults }

const defaults: RenderMethods = {
    drawBackground: (context: CanvasRenderingContext2D, view: NodeView) => {
        context.fillStyle = "FFFF00";
        context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        context.fill();
    },
    drawNode: (ctx: CanvasRenderingContext2D, view: NodeView, node: NodeRenderData) => {
        ctx.fillStyle = "#FF5500";
        ctx.beginPath();
        ctx.arc(
            node.positionOnCanvas.x(),
            node.positionOnCanvas.x(),
            node.getRadius() * graph.getScale() * .6,
            0,
            2 * Math.PI
        );
        ctx.fill();
    },
    connectNodes: (context: CanvasRenderingContext2D, view: NodeView, nodeA: Node, nodeB: Node) => {

    },
    drawForeground: (context: CanvasRenderingContext2D, view: NodeView) => { }
}
