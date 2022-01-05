import {Action} from "core/actions/Action";

import {Wire} from "core/models/Wire";
import {LED} from "digital/models/ioobjects/outputs/LED";
import {Label} from "digital/models/ioobjects/other/Label";


export class ColorChangeAction implements Action {
    /**
     * The 3 components of the action: LED, Label and Wire
     */
    private component: LED | Label | Wire;

    /**
     * The initial color of the component
     */
    private initialColor: string;
    /**
     * The target color of the component
     */
    private targetColor: string;

    /**
     * Initialize the action with the given component and the given targetColor
     * 
     * @param component The component we want to change the color
     * @param targetCol The target color we want change to
     */
    public constructor(component: LED | Label | Wire, targetCol: string) {
        this.component = component;
        this.initialColor = component.getColor();
        this.targetColor = targetCol;
    }

    /**
     * Set the component's color to the targetColor
     * 
     * @returns This Action
     */
    public execute(): Action {
        this.component.setColor(this.targetColor);

        return this;
    }

    /**
     * Undo the action, back the color of the component to the initialColor
     * 
     * @returns This Action
     */
    public undo(): Action {
        this.component.setColor(this.initialColor);

        return this;
    }

    public getName(): string {
        return "Color Change";
    }

}
