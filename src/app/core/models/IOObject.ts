import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {Name}       from "core/utils/Name";
import {Selectable} from "core/utils/Selectable";

import {Prop, PropInfo} from "core/models/PropInfo";


export abstract class IOObject implements Selectable {
    @serialize
    protected name: Name;

    @serialize
    protected props: Record<string, Prop>;

    protected constructor(initialProps: Record<string, Prop> = {}) {
        this.name = new Name(this.getDisplayName());
        this.props = { ...initialProps };
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    public hasProp(key: string): boolean {
        return (key in this.props);
    }

    public setName(name: string): void {
        this.name.setName(name);
    }

    public setProp(key: string, val: Prop) {
        const prop = this.props[key];
        if (prop === undefined)
            throw new Error(`Can't find property: ${key} in ${this.getName()}!` +
                            `My props: ${Object.entries(this.props).join(",")}`);

        this.props[key] = val;
    }

    public abstract getDisplayName(): string;

    public getName(): string {
        return this.name.getName();
    }

    public getProp(key: string): Prop {
        return this.props[key];
    }

    public getPropInfo(_key: string): PropInfo | undefined {
        return undefined;
    }

    public getProps() {
        return this.props;
    }
}
