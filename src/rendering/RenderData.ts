import { Node } from "../index";
import { NodeLinkRenderData } from "./NodeLinkRenderData";
import { ItemRenderData } from "./ItemRenderData";

export { RenderData }

interface RenderData {
    items: Array<ItemRenderData>,
    links: Array<NodeLinkRenderData>
}