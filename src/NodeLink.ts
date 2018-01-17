// MIT - Eli C Davis
import { Node } from "./Node";

export { NodeLink };

interface NodeLink {
    a: Node;
    b: Node;
    data: any;
}