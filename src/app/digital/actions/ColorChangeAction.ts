import {Action} from "core/actions/Action";

import {Wire} from "core/models/Wire";
import {LED} from "digital/models/ioobjects/outputs/LED";
import {Label} from "digital/models/ioobjects/other/Label";


export class ColorChangeAction implements Action {
    private component: LED | Label | Wire;

    private initialColor: string;
    private targetColor: string;

    public constructor(component: LED | Label | Wire, targetCol: string) {
        this.component = component;
        this.initialColor = component.getColor();
        this.targetColor = targetCol;
    }

    public execute(): Action {
        this.component.setColor(this.targetColor);

        return this;
    }

    public undo(): Action {
        this.component.setColor(this.initialColor);

        return this;
    }

}
