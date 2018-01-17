import { Vector } from "../Vector";
import { Node } from "../index";

export { ItemRenderData }

interface ItemRenderData {
    positionOnCanvas: Vector,
    scale: number,
    containsPoint: (data: ItemRenderData, point: Vector) => boolean,
    originalItem: Node
}