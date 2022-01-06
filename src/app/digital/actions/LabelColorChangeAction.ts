import {Action} from "core/actions/Action";
import {Label} from "digital/models/ioobjects/other/Label";

export class LabelColorChangeAction implements Action {
    /**
     * The labal component of the action
     */
    private label: Label;

    /**
     * The initial color of the label
     */
    private initialColor: string;
    /**
     * The target color of the label
     */
    private targetColor: string;

    /**
     * Initialize the Action with label value 'label' and targetCol 'y'
     * 
     * @param label The label component to change
     * @param targetCol The target color to change
     */
    public constructor(label: Label, targetCol: string) {
        this.label = label;

        this.initialColor = label.getColor();
        this.targetColor = targetCol;
    }

    /**
     * Set the label's color to the target color
     * 
     * @returns This action
     */
    public execute(): Action {
        this.label.setColor(this.targetColor);

        return this;
    }

    /**
     * Undo the change and reset the color of the label to initial color
     * 
     * @returns This action
     */
    public undo(): Action {
        this.label.setColor(this.initialColor);

        return this;
    }

    public getName(): string {
        return "Changed Label Color";
    }

}