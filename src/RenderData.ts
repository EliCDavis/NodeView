import { Node } from "./index";
import { NodeLinkRenderData } from "./NodeLinkRenderData";
import { NodeRenderData } from "./NodeRenderData";

export { RenderData }

interface RenderData {
    nodes: Array<NodeRenderData>,
    links: Array<NodeLinkRenderData>
}