import {Action} from "core/actions/Action";

import {BaseObject} from "core/models/BaseObject";
import {Prop}       from "core/models/PropInfo";


class SetPropertyAction implements Action {
    private readonly obj: BaseObject;

    private readonly propKey: string;

    private readonly initialProp: Prop;
    private readonly targetProp: Prop;

    public constructor(obj: BaseObject, key: string, prop: Prop) {
        if (!obj.hasProp(key))
            throw new Error(`Cannot find property ${key} in ${obj}!`);

        this.obj = obj;
        this.propKey = key;
        this.initialProp = obj.getProp(key);
        this.targetProp = prop;

        this.execute();
    }

    public execute(): Action {
        this.obj.setProp(this.propKey, this.targetProp);

        return this;
    }

    public undo(): Action {
        this.obj.setProp(this.propKey, this.initialProp);

        return this;
    }

    public getName(): string {
        return `Changed Property ${this.propKey}`;
    }

    public getCustomInfo(): string[] {
        return [`From ${this.initialProp} to ${this.targetProp}`];
    }
}

export function SetProperty(obj: BaseObject, key: string, prop: Prop) {
    return new SetPropertyAction(obj, key, prop);
}
