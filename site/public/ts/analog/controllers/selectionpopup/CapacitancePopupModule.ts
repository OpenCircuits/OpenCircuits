import $ from "jquery";

import {GroupAction} from "core/actions/GroupAction";
import {CapacitanceChangeAction} from "analog/actions/CapacitanceChangeAction";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";

import {Capacitor} from "analog/models/eeobjects/Capacitor";

import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

export class CapacitancePopupModule extends SelectionPopupModule {
    private input: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        super(circuitController, $("div#popup-capacitance-text"));

        this.input = this.el.find("input#popup-capacitance")[0] as HTMLInputElement;
        this.input.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const clocks = selections
                .filter(o => o instanceof Capacitor)
                .map(o => o as Capacitor);

        // Only enable if there's exactly 1 type, so just resistors
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: number[] = [];
            clocks.forEach(c => counts.push(c.getCapacitance()));

            const same = counts.every((count) => count === counts[0]);

            this.input.value = same ? counts[0].toString() : "";
            this.input.placeholder = same ? "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Capacitor[];
        const countAsNumber = this.input.valueAsNumber;

        this.circuitController.addAction(new GroupAction(
            selections.map(c => new CapacitanceChangeAction(c, countAsNumber))
        ).execute());

        this.circuitController.render();
    }
}
