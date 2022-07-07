import {Action} from "core/actions/Action";

import {Component} from "core/models";

import {Prop} from "core/models/PropInfo";


export class SetPropertyAction implements Action {
    private component: Component;

    private propKey: string;

    private initialProp: Prop;
    private targetProp: Prop;

    public constructor(component: Component, key: string, prop: Prop) {
        if (!component.hasProp(key))
            throw new Error(`Cannot find property ${key} in ${component.getName()}!`);

        this.component = component;
        this.propKey = key;
        this.initialProp = component.getProp(key);
        this.targetProp = prop;
    }

    public execute(): Action {
        this.component.setProp(this.propKey, this.targetProp);

        return this;
    }

    public undo(): Action {
        this.component.setProp(this.propKey, this.initialProp);

        return this;
    }

    public getName(): string {
        return "Changed Property";
    }

}
