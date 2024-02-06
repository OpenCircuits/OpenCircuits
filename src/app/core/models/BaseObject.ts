import {serialize} from "serialeazy";

import {Prop, PropInfo} from "core/models/PropInfo";


export abstract class BaseObject {
    @serialize
    protected props: Record<string, Prop>;

    protected constructor(initialProps: Record<string, Prop> = {}) {
        this.props = { ...initialProps };
    }

    public hasProp(key: string): boolean {
        return (key in this.props);
    }

    public setProp(key: string, val: Prop) {
        const prop = this.props[key];
        if (prop === undefined) {
            throw new Error(`Can't find property: ${key} in ${this}!` +
                            `My props: ${Object.entries(this.props).join(",")}`);
        }
        this.props[key] = val;
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
