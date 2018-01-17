
import { ItemRenderData } from "./ItemRenderData"

export { NodeLinkRenderData }

interface NodeLinkRenderData {
    a: ItemRenderData,
    b: ItemRenderData,
    data: object
}