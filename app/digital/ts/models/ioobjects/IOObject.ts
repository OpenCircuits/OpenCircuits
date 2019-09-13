import {XMLNode} from "../../utils/io/xml/XMLNode";
import {XMLable} from "../../utils/io/xml/XMLable";

import {Selectable} from "../../utils/Selectable";
import {Name} from "../../utils/Name";

import {CircuitDesigner} from "../CircuitDesigner";

export abstract class IOObject implements Selectable, XMLable {
    protected designer?: CircuitDesigner;
    protected name: Name;

    protected constructor() {
        this.name = new Name(this.getDisplayName());
    }

    public abstract activate(signal: boolean, i?: number): void;

    public setDesigner(designer?: CircuitDesigner): void {
        this.designer = designer;
    }

    public getDesigner(): CircuitDesigner {
        return this.designer;
    }

    public setName(name: string): void {
        this.name.setName(name);
    }
    public getName(): string {
        return this.name.getName();
    }

    public copy(): IOObject {
        const copy = new (<new () => IOObject>this.constructor)();
        copy.name = new Name(this.name.getName());
        return copy;
    }

    public save(node: XMLNode): void {
        node.addAttribute("name", this.name.getName());
    }
    public load(node: XMLNode): void {
        this.name = new Name(node.getAttribute("name"));
    }

    public abstract getDisplayName(): string;
    public abstract getXMLName(): string;

}
