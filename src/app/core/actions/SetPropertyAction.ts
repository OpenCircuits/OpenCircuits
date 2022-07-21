import {Action} from "core/actions/Action";

import {IOObject} from "core/models";

import {Prop} from "core/models/PropInfo";


export class SetPropertyAction implements Action {
    private obj: IOObject;

    private propKey: string;

    private initialProp: Prop;
    private targetProp: Prop;

    public constructor(obj: IOObject, key: string, prop: Prop) {
        if (!obj.hasProp(key))
            throw new Error(`Cannot find property ${key} in ${obj.getName()}!`);

        this.obj = obj;
        this.propKey = key;
        this.initialProp = obj.getProp(key);
        this.targetProp = prop;
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