import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

import {LED} from "digital/models/ioobjects/outputs/LED";
import {Label} from "digital/models/ioobjects/other/Label";

import {GroupAction} from "core/actions/GroupAction";
import {ColorChangeAction} from "digital/actions/ColorChangeAction";

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
        const leds   = selections.filter(o => o instanceof LED) as LED[];
        const labels = selections.filter(o => o instanceof Label) as Label[];

        const enable = selections.length > 0 && (selections.length == leds.length ||
                                                 selections.length == labels.length);

        if (enable) {
            const colors: string[] = [];
            leds.forEach(l => colors.push(l.getColor()));
            labels.forEach(l => colors.push(l.getColor()));

            const same = colors.every((color) => color == colors[0]);

            this.color.value = same ? colors[0] : "#ffffff";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as (LED | Label)[];
        const targetColor = this.color.value;

        this.circuitController.addAction(new GroupAction(
            selections.map(l => new ColorChangeAction(l, targetColor))
        ).execute());

        this.circuitController.render();
    }
}
