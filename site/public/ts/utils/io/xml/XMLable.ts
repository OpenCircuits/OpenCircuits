import {XMLNode} from "./XMLNode";

export interface XMLable {
    save(node: XMLNode): void;
    load(node: XMLNode): void;

    getXMLName(): string;
}
