import {CircuitDesigner} from "./CircuitDesigner";
import {CircuitMetadata} from "./CircuitMetadata";
import {XMLable} from "../utils/io/xml/XMLable";
import {XMLNode} from "../utils/io/xml/XMLNode";

// This mostly encapsulates the circuit designer and any metadata of the circuit
// This separates the behavior of facilitating synchronization with the server
//  with the behavior of the application.
export class Circuit implements XMLable {
    designer: CircuitDesigner;
    metadata: CircuitMetadata = new CircuitMetadata();

    public save(node: XMLNode): void {
        node.saveChildLable(this.designer);
        node.saveChildLable(this.metadata);
    }

    public load(node: XMLNode): void {
        node.loadChildLable(this.designer);
        node.loadChildLable(this.metadata);
    }

    getXMLName(): string {
        return "circuit";
    }
}
