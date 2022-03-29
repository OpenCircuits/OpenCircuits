import {Action} from "core/actions/Action";

import {Wire} from "core/models/Wire";
import {Label} from "analog/models/eeobjects/other/Label";


export class ColorChangeAction implements Action {
    /**
     * The 32components of the action: Label and Wire
     */
    private component: Label | Wire;

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
    public constructor(component: Label | Wire, targetCol: string) {
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
