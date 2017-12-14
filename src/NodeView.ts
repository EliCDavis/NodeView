import { Vector } from "./Vector";

export { NodeView }

class NodeView {

    context: CanvasRenderingContext2D;

    scale: number;

    topLeftPosition: Vector;

    lastSeenMousePosition: Vector;

    constructor(canvasElement: HTMLCanvasElement) {

        // Sanitize input
        if(canvasElement == null){
            throw new Error("Canvas Element Can Not Be Null!")
        }

        this.context = canvasElement.getContext("2d");
        
    }

}