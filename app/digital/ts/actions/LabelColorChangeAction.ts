import {Action} from "core/actions/Action";
import {Label} from "digital/models/ioobjects/other/Label";

export class LabelColorChangeAction implements Action {
    private label: Label;

    private initialColor: string;
    private targetColor: string;

    public constructor(label: Label, targetCol: string) {
        this.label = label;

        this.initialColor = label.getColor();
        this.targetColor = targetCol;
    }

    public execute(): Action {
        this.label.setColor(this.targetColor);

        return this;
    }

    public undo(): Action {
        this.label.setColor(this.initialColor);

        return this;
    }

}