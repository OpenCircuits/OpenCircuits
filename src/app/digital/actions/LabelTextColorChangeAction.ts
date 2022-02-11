import {Action} from "core/actions/Action";
import {Label} from "digital/models/ioobjects/other/Label";

export class LabelTextColorChangeAction implements Action {
    /**
     * The label compoenent of this action
     */
    private label: Label;

    /**
     * The initial color of the label text
     */
    private initialColor: string;
    /**
     * The target color of the label text
     */
    private targetColor: string;

    /**
     * Initialize the action with label value 'label' and targetColor value 'targetCol'
     * 
     * @param label The label component
     * @param targetCol The target color
     */
    public constructor(label: Label, targetCol: string) {
        this.label = label;

        this.initialColor = label.getTextColor();
        this.targetColor = targetCol;
    }

    /**
     * Change the color of the text to the target color.
     * 
     * @returns This action
     */
    public execute(): Action {
        this.label.setTextColor(this.targetColor);

        return this;
    }

     /**
     * Undo the change, back the color of the text to the initial color.
     * 
     * @returns This action
     */
    public undo(): Action {
        this.label.setTextColor(this.initialColor);

        return this;
    }

    public getName(): string {
        return "Changed Label Text Color";
    }

}