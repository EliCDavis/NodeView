// MIT - Eli C Davis
import { RenderMethods } from "./RenderMethods";
import { NodeView } from "../NodeView";
import { Node } from "../Node";
import { ItemRenderData } from "./ItemRenderData";


export { defaults };

const defaults: RenderMethods = {
    drawBackground: (context: CanvasRenderingContext2D, view: NodeView) => {
        context.beginPath();
        context.fillStyle = "#b9c5d5";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.fill();
    },
    drawNode: (ctx: CanvasRenderingContext2D, view: NodeView, node: ItemRenderData) => {
        ctx.fillStyle = "#32444e";
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
    connectNodes: (context: CanvasRenderingContext2D, view: NodeView, nodeA: ItemRenderData, nodeB: ItemRenderData) => {
        context.strokeStyle = '#000';
        context.lineWidth = 3 * view.getScale();
        context.beginPath();
        context.moveTo(nodeA.positionOnCanvas.x(), nodeA.positionOnCanvas.y());
        context.lineTo(nodeB.positionOnCanvas.x(), nodeB.positionOnCanvas.y());
        context.stroke();
    },
    drawForeground: (context: CanvasRenderingContext2D, view: NodeView) => { }
};
