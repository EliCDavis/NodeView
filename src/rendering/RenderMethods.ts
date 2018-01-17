import { NodeView } from "../NodeView";
import { Node } from "../Node";
import { ItemRenderData } from "./ItemRenderData";

export { RenderMethods }

type BackgroundRenderer = (context: CanvasRenderingContext2D, view: NodeView) => void;
type NodeRenderer = (context: CanvasRenderingContext2D, view: NodeView, node: ItemRenderData) => void;
type NodeConectionRenderer = (context: CanvasRenderingContext2D, view: NodeView, nodeA: ItemRenderData, nodeB: ItemRenderData) => void
type ForegroundRenderer = (context: CanvasRenderingContext2D, view: NodeView) => void; 

/**
 * All methods needed for rendering a graph in it's entirity.
 */
interface RenderMethods {
    drawBackground: BackgroundRenderer,
    drawNode: NodeRenderer,
    connectNodes: NodeConectionRenderer,
    drawForeground: ForegroundRenderer
}