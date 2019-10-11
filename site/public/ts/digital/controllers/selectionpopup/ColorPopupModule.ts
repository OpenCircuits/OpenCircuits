import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

import {LED} from "digital/models/ioobjects/outputs/LED";

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
        const leds = selections.filter(o => o instanceof LED) as LED[];
        const enable = selections.length == leds.length && leds.length > 0;

        if (enable) {
            const color: string = leds[0].getColor();
            let same = true;
            for (let i = 1; i < leds.length && same; ++i) {
                same = leds[i].getColor() == color;
            }

            this.color.value = same ? color : "#cccccc";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as LED[];
        const targetColor = this.color.value;

        this.circuitController.addAction(new GroupAction(
            selections.map(l => new ColorChangeAction(l, targetColor))
        ).execute());

        this.circuitController.render();
    }
}
