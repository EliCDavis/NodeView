import { Vector } from "./Vector";


export { NodeCreationOptions }

/**
 * A bunch of optional configurations you can specify when creating nodes
 */
interface NodeCreationOptions {
    radius?: number
    position?: Vector
}