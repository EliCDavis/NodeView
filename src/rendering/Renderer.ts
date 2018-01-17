import { RenderMethods } from "./RenderMethods";
import { defaults as DefualtRenderer } from "./DefaultRenderMethods";
import { NodeView } from "../NodeView";
import { RenderData } from "./RenderData";

export { Renderer }

class Renderer {

    private requestFrameID: number;

    private renderMethods: RenderMethods;

    constructor(
        private view: NodeView,
        private context: CanvasRenderingContext2D,
        private getRenderData: () => RenderData,
        overridingRenderMethods?: RenderMethods
    ) {
        this.renderMethods = overridingRenderMethods ? overridingRenderMethods : DefualtRenderer;
    }

    public start(): void {
        this.requestFrame();
    }

    public stop(): void {
        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = undefined;
        }
    }

    /**
     * Called every frame whenever the browser is ready for the next frame to be drawn
     */
    private animationFrame() {
        const renderData: RenderData = this.getRenderData();

        this.renderMethods.drawBackground(this.context, this.view);
        renderData.links.forEach(link => this.renderMethods.connectNodes(this.context, this.view, link.a, link.b));
        renderData.items.forEach(node => this.renderMethods.drawNode(this.context, this.view, node));
        this.renderMethods.drawForeground(this.context, this.view);

        this.requestFrame();
    }

    private requestFrame(): void {
        this.requestFrameID = window.requestAnimationFrame(() => this.animationFrame());
    }

}