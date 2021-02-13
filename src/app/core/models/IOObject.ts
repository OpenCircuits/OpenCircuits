import {Vector} from "Vector";

import {Selectable} from "core/utils/Selectable";
import {serialize} from "serialeazy";
import {Name} from "core/utils/Name";

import {CircuitDesigner} from "./CircuitDesigner";

export abstract class IOObject implements Selectable {
    @serialize
    protected designer?: CircuitDesigner;

    @serialize
    protected name: Name;

    protected constructor() {
        this.name = new Name(this.getDisplayName());
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    // public abstract activate(signal: boolean, i?: number): void;

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

    public abstract getDisplayName(): string;
}
