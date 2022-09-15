import {Vector} from "Vector";

import {Selectable} from "core/utils/Selectable";

import {BaseObject} from "core/models/BaseObject";
import {Prop}       from "core/models/PropInfo";


export abstract class IOObject extends BaseObject implements Selectable {
    protected constructor(initialProps: Record<string, Prop> = {}) {
        super({
            name: false, // Initially is "false" for "not set"
            ...initialProps,
        });
    }

    public setName(name: string): void {
        this.setProp("name", name);
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    public isNameSet(): boolean {
        return (this.getProp("name") !== false);
    }

    public abstract getDisplayName(): string;

    public getName(): string {
        if (!this.isNameSet())
            return this.getDisplayName();
        return this.getProp("name") as string;
    }

    public override toString(): string {
        return (
            this.isNameSet()
            ? `${this.getName()} (${this.getDisplayName()})`
            : this.getDisplayName()
        );
    }
}
