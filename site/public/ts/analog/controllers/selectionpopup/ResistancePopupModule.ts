import $ from "jquery";

import {GroupAction} from "core/actions/GroupAction";
import {ResistanceChangeAction} from "analog/actions/ResistanceChangeAction";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";

import {Resistor} from "analog/models/eeobjects/Resistor";

import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

export class ResistancePopupModule extends SelectionPopupModule {
    private input: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        super(circuitController, $("div#popup-resistance-text"));

        this.input = this.el.find("input#popup-resistance")[0] as HTMLInputElement;
        console.log(this.input);
        this.input.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const clocks = selections
                .filter(o => o instanceof Resistor)
                .map(o => o as Resistor);

        // Only enable if there's exactly 1 type, so just resistors
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: number[] = [];
            clocks.forEach(r => counts.push(r.getResistance()));

            const same = counts.every((count) => count === counts[0]);

            this.input.value = same ? counts[0].toString() : "";
            this.input.placeholder = same ? "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Resistor[];
        const countAsNumber = this.input.valueAsNumber;

        this.circuitController.addAction(new GroupAction(
            selections.map(r => new ResistanceChangeAction(r, countAsNumber))
        ).execute());

        this.circuitController.render();
    }
}
