import { NodeView } from "./NodeView";
import { MouseState } from "./MouseState";
import { Vector } from "./index";
import { Node } from "./Node";


export { InteractionManager }

interface DraggableItem {
    item: NodeView | Node,
    itemPosition: Vector,
    mousePosition: Vector
}

class InteractionManager {

    private currentMouseState: MouseState;

    private lastMouseEvent: MouseEvent;

    private itemBeingDragged: DraggableItem;

    constructor(
        private view: NodeView,
        private canvas: HTMLCanvasElement
    ) {

        this.currentMouseState = MouseState.Free;
        this.lastMouseEvent = null;
        this.itemBeingDragged = null;

        // Mousewheel for zoom
        canvas.addEventListener("wheel", event => view.zoom(event.deltaY > 0 ? 0.3 : -0.3));

        // mouse listenters
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(this, e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(this, e));
        canvas.addEventListener('mouseout', (e) => this.onMouseOut(this, e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(this, e));
        canvas.addEventListener('dblclick', (e) => this.onDoubleClick(this, e));

    }

    private relativeMouseCoordinates(event: MouseEvent): Vector {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector(event.clientX - rect.left, event.clientY - rect.top);
    }

    private mouseToGraphCoordinates(event: MouseEvent): Vector {
        return this.relativeMouseCoordinates(event).scale(1.0 / this.view.getScale()).subtract(this.view.getTopLeftPosition())
    }

    private onMouseUp(manager: InteractionManager, event: MouseEvent) {
        manager.lastMouseEvent = event;
        manager.itemBeingDragged = null;
    }

    // THE CONTEXT OF "THIS" HAS CHANGED
    private onMouseDown(manager: InteractionManager, event: MouseEvent) {
        manager.lastMouseEvent = event;
        manager.currentMouseState = MouseState.Hold;

        const coordinates = manager.mouseToGraphCoordinates(event);
        manager.itemBeingDragged = {
            item: manager.view,
            itemPosition: manager.view.getTopLeftPosition(),
            mousePosition: coordinates
        }
    }

    private onMouseOut(manager: InteractionManager, event: MouseEvent) {
        manager.lastMouseEvent = event;
        manager.currentMouseState = MouseState.Free;
        manager.itemBeingDragged = null;
    }

    private onMouseMove(manager: InteractionManager, event: MouseEvent) {
        manager.lastMouseEvent = event;
        if (!manager.itemBeingDragged) {
            return;
        }
        manager.view.setPosition(manager.itemBeingDragged.mousePosition.subtract(manager.relativeMouseCoordinates(event).scale(1.0 / manager.view.getScale())))
    }

    private onDoubleClick(manager: InteractionManager, event: MouseEvent) {
        manager.lastMouseEvent = event;
    }

}