import { Node } from "./index";
import { NodeLink } from "./NodeLink";
import { NodeRenderData } from "./NodeRenderData";


export { RenderData }

interface RenderData {
    nodes: Array<NodeRenderData>,
    links: Array<NodeLink>
}