import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {Name}       from "core/utils/Name";
import {Selectable} from "core/utils/Selectable";
import {Distinguishable} from "core/utils/Distinguishable";


export abstract class IOObject extends Distinguishable implements Selectable {
    @serialize
    protected name: Name;

    protected constructor() {
        super()
        this.name = new Name(this.getDisplayName());
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    // public abstract activate(signal: boolean, i?: number): void;

    public setName(name: string): void {
        this.name.setName(name);
    }
    public getName(): string {
        return this.name.getName();
    }

    public abstract getDisplayName(): string;
}
