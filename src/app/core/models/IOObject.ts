import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {Name}       from "core/utils/Name";
import {Selectable} from "core/utils/Selectable";

import {BaseObject} from "core/models/BaseObject";
import {Prop}       from "core/models/PropInfo";


export abstract class IOObject extends BaseObject implements Selectable {
    @serialize
    protected name: Name;

    protected constructor(initialProps: Record<string, Prop> = {}) {
        super(initialProps);
        this.name = new Name(this.getDisplayName());
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    public setName(name: string): void {
        this.name.setName(name);
    }

    public abstract getDisplayName(): string;

    public override toString(): string {
        return (
            this.name.isSet()
            ? `${this.getName()} (${this.getDisplayName()})`
            : this.getDisplayName()
        );
    }

    public getName(): string {
        return this.name.getName();
    }
}
