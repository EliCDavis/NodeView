import { RenderMethods } from "./RenderMethods";
import { NodeView } from "./NodeView";
import { Node } from "./Node";
import { NodeRenderData } from "./NodeRenderData";


export { defaults }

const defaults: RenderMethods = {
    drawBackground: (context: CanvasRenderingContext2D, view: NodeView) => {
        context.beginPath();
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.fill();
    },
    drawNode: (ctx: CanvasRenderingContext2D, view: NodeView, node: NodeRenderData) => {
        ctx.fillStyle = "#FF5500";
        ctx.beginPath();
        ctx.arc(
            node.positionOnCanvas.x(),
            node.positionOnCanvas.y(),
            node.scale,
            0,
            2 * Math.PI
        );
        ctx.fill();
    },
    connectNodes: (context: CanvasRenderingContext2D, view: NodeView, nodeA: NodeRenderData, nodeB: NodeRenderData) => {

    },
    drawForeground: (context: CanvasRenderingContext2D, view: NodeView) => { }
}
