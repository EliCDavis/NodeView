
import { NodeRenderData } from "./NodeRenderData"

export { NodeLinkRenderData }

interface NodeLinkRenderData {
    a: NodeRenderData,
    b: NodeRenderData,
    data: object
}