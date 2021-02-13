import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

import {Label} from "digital/models/ioobjects/other/Label";

import {GroupAction} from "core/actions/GroupAction";
import {LabelColorChangeAction} from "digital/actions/LabelColorChangeAction";

export class ColorPopupModule extends SelectionPopupModule {
    private color: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-color-text"));

        this.color = this.el.find("input#popup-color-picker")[0] as HTMLInputElement;
        this.color.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const labels = selections.filter(o => o instanceof Label) as Label[];
        const enable = selections.length == labels.length && labels.length > 0;

        if (enable) {
            const color: string = labels[0].getColor();
            let same = true;
            for (let i = 1; i < labels.length && same; ++i) {
                same = labels[i].getColor() == color;
            }

            this.color.value = same ? color : "#cccccc";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Label[];
        const targetColor = this.color.value;

        this.circuitController.addAction(new GroupAction(
            selections.map(l => new LabelColorChangeAction(l, targetColor))
        ).execute());

        this.circuitController.render();
    }
}
