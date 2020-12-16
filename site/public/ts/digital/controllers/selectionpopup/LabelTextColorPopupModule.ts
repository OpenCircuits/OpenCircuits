import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

import {Label} from "digital/models/ioobjects/other/Label";

import {GroupAction} from "core/actions/GroupAction";
import {LabelTextColorChangeAction} from "digital/actions/LabelTextColorChangeAction";

export class LabelTextColorPopupModule extends SelectionPopupModule {
    private textColor: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-colortext-text"));

        this.textColor = this.el.find("input#popup-color-picker")[0] as HTMLInputElement;
        this.textColor.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const labels = selections.filter(o => o instanceof Label) as Label[];
        const enable = selections.length == labels.length && labels.length > 0;

        if (enable) {
            const color: string = labels[0].getTextColor();
            let same = true;
            for (let i = 1; i < labels.length && same; ++i) {
                same = labels[i].getTextColor() == color;
            }

            this.textColor.value = same ? color : "#000000";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Label[];
        const targetColor = this.textColor.value;

        this.circuitController.addAction(new GroupAction(
            selections.map(l => new LabelTextColorChangeAction(l, targetColor))
        ).execute());

        this.circuitController.render();
    }
}
