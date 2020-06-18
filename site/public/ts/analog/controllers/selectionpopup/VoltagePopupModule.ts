import $ from "jquery";

import {GroupAction} from "core/actions/GroupAction";
import {VoltageChangeAction} from "analog/actions/VoltageChangeAction";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";

import {Battery} from "analog/models/eeobjects/Battery";

import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

export class VoltagePopupModule extends SelectionPopupModule {
    private input: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        super(circuitController, $("div#popup-voltage-text"));

        this.input = this.el.find("input#popup-voltage")[0] as HTMLInputElement;
        this.input.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const clocks = selections
                .filter(o => o instanceof Battery)
                .map(o => o as Battery);

        // Only enable if there's exactly 1 type, so just resistors
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: number[] = [];
            clocks.forEach(b => counts.push(b.getVoltage()));

            const same = counts.every((count) => count === counts[0]);

            this.input.value = same ? counts[0].toString() : "";
            this.input.placeholder = same ? "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Battery[];
        const countAsNumber = this.input.valueAsNumber;

        this.circuitController.addAction(new GroupAction(
            selections.map(b => new VoltageChangeAction(b, countAsNumber))
        ).execute());

        this.circuitController.render();
    }
}
