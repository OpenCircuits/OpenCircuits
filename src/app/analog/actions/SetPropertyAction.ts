import {Action} from "core/actions/Action";
import {AnalogComponent} from "analog/models";
import {Prop} from "analog/models/AnalogComponent";


export class SetPropertyAction implements Action {
    private component: AnalogComponent;

    private propKey: string;

    private initialProp: Prop;
    private targetProp: Prop;

    public constructor(component: AnalogComponent, key: string, prop: Prop) {
        if (!component.hasProp(key))
            throw new Error(`Cannot find property ${key} in ${component.getName()}!`);

        this.component = component;
        this.propKey = key;
        this.initialProp = component.getProp(key);
        this.targetProp = prop;
    }

    /**
     * Set the label's color to the target color
     *
     * @returns This action
     */
    public execute(): Action {
        this.component.setProp(this.propKey, this.targetProp);

        return this;
    }

    /**
     * Undo the change and reset the color of the label to initial color
     *
     * @returns This action
     */
    public undo(): Action {
        this.component.setProp(this.propKey, this.initialProp);

        return this;
    }

    public getName(): string {
        return "Changed Property";
    }

}