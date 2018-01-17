import { NodeView } from "./NodeView";
import { MouseState } from "./MouseState";
import { Vector } from "./index";
import { Node } from "./Node";
import { RenderData } from "./rendering/RenderData";
import { ItemRenderData } from "./rendering/ItemRenderData";


export { InteractionManager }

interface Draggable {
    item: NodeView | Node,
    itemPosition: Vector,
    mousePosition: Vector,
    positionCalculator: (manager: InteractionManager, item: Draggable, event: MouseEvent) => Vector
}

class InteractionManager {

    private currentMouseState: MouseState;

    private lastMouseEvent: MouseEvent;

    private itemBeingDragged: Draggable;

    constructor(
        private view: NodeView,
        private canvas: HTMLCanvasElement,
        private renderData: () => RenderData
    ) {

        this.currentMouseState = MouseState.Free;
        this.lastMouseEvent = null;
        this.itemBeingDragged = null;

        // Mousewheel for zoom
        canvas.addEventListener("wheel", event => view.zoom(event.deltaY > 0 ? 0.3 : -0.3));

        // mouse listenters
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseout', (e) => this.onMouseOut(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

    }

    private relativeMouseCoordinates(event: MouseEvent): Vector {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector(event.clientX - rect.left, event.clientY - rect.top);
    }

    private mouseToGraphCoordinates(event: MouseEvent): Vector {
        return this.relativeMouseCoordinates(event).scale(1.0 / this.view.getScale()).subtract(this.view.getPosition())
    }

    private nodePositionCalculator(manager: InteractionManager, item: Draggable, event: MouseEvent): Vector {
        return manager.mouseToGraphCoordinates(event).add(item.itemPosition.subtract(item.mousePosition));
    }
    
    private graphPositionCalculator(manager: InteractionManager, item: Draggable, event: MouseEvent): Vector {
        return item.item.getPosition().add(manager.mouseToGraphCoordinates(event).subtract(manager.itemBeingDragged.mousePosition));
    }

    private onMouseUp(event: MouseEvent) {
        this.lastMouseEvent = event;
        this.itemBeingDragged = null;
    }

    private onMouseDown(event: MouseEvent) {
        this.lastMouseEvent = event;
        this.currentMouseState = MouseState.Hold;

        const coordinates = this.mouseToGraphCoordinates(event);

        // Determine if we've grabbed a node
        const selectedItem = this.renderData().items.find(item => item.containsPoint(item, this.relativeMouseCoordinates(event)));

        if (selectedItem) {
            this.itemBeingDragged = {
                item: selectedItem.originalItem,
                itemPosition: selectedItem.originalItem.getPosition(),
                mousePosition: coordinates,
                positionCalculator: this.nodePositionCalculator
            }
        } else {
            this.itemBeingDragged = {
                item: this.view,
                itemPosition: this.view.getPosition(),
                mousePosition: coordinates,
                positionCalculator: this.graphPositionCalculator
            }
        }
    }

    private onMouseOut(event: MouseEvent) {
        this.lastMouseEvent = event;
        this.currentMouseState = MouseState.Free;
        this.itemBeingDragged = null;
    }

    private onMouseMove(event: MouseEvent) {
        this.lastMouseEvent = event;
        if (!this.itemBeingDragged) {
            return;
        }
        this.itemBeingDragged.item.setPosition(this.itemBeingDragged.positionCalculator(this, this.itemBeingDragged, event))
    }

    private onDoubleClick(event: MouseEvent) {
        this.lastMouseEvent = event;
    }

}