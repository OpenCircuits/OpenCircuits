import {Name} from "../../utils/Name";
import {CircuitDesigner} from "../CircuitDesigner";

export abstract class IOObject {
    protected designer?: CircuitDesigner;
    protected name: Name;

    constructor() {
        this.name = new Name(this.getDisplayName());
    }

	public setDesigner(designer?: CircuitDesigner): void {
		this.designer = designer;
	}

	public getDesigner(): CircuitDesigner {
		return this.designer;
	}

    public abstract activate(signal: boolean, i?: number): void;

    public abstract save(node: HTMLElement): HTMLElement;
    public abstract load(node: HTMLElement): void;

    public abstract getDisplayName(): string;
}
