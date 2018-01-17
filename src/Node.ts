import { Vector } from "./Vector";
import { NodeView } from "./NodeView";
import { GenerateUUID } from "./util";
import { NodeCreationOptions } from "./NodeCreationOptions";

export { Node };

const defaultNodeCreationsOptions: NodeCreationOptions = {
    position: new Vector(0, 0),
    radius: 50
}

/**
 * A single node to be rendered on the graph
 */
class Node {

    /**
     * Position of node in graph space (not canvas)
     */
    private position: Vector;

    /**
     * 'Radius' of node to determine gravity forces, user clicks, etc.
     */
    private radius: number;

    /**
     * Unique Identifier to difrentiate from other nodes
     */
    private id: string;

    constructor(optionalConfig?: NodeCreationOptions) {

        const finalRenderConfig: NodeCreationOptions = this.overrideDefaultsWithUserConfigurations(defaultNodeCreationsOptions, optionalConfig);

        // Apporpriatly assign variables according to configurations
        this.position = finalRenderConfig.position;
        this.radius = finalRenderConfig.radius;

        // TODO: Figure out better method for generating ID..
        // (This will need to change once we can group nodes)
        this.id = GenerateUUID();
    }

    /**
     * 
     * @param initialConfig All Default configurations
     * @param userSpecifiedConfig User specified configurations to override defaults
     */
    private overrideDefaultsWithUserConfigurations(initialConfig: NodeCreationOptions, userSpecifiedConfig: NodeCreationOptions): NodeCreationOptions {
        if (!initialConfig) {
            throw new Error("No default configurations to fall back on! WHAT HAVE YOU DONE");
        }

        if (!userSpecifiedConfig) {
            return initialConfig;
        }

        return {
            position: userSpecifiedConfig.position ? userSpecifiedConfig.position : initialConfig.position,
            radius: userSpecifiedConfig.radius ? userSpecifiedConfig.radius : initialConfig.radius
        }
    }

    public getRadius(): number {
        return this.radius
    }

    public getId(): string {
        return this.id;
    }

    public getPosition(): Vector {
        return this.position;
    }

    public setPosition(newPosition: Vector): void {
        this.position = newPosition;
    }

}