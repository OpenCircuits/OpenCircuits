import {GroupAction} from "core/actions/GroupAction";
import {ClockFrequencyChangeAction} from "digital/actions/ClockFrequencyChangeAction";

import {MainDesignerController} from "../../shared/controllers/MainDesignerController";

import {Clock} from "digital/models/ioobjects/inputs/Clock";

import {SelectionPopupModule} from "./SelectionPopupModule";

export class ClockFrequencyPopupModule extends SelectionPopupModule {
    private input: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-clock-delay-text"));

        this.input = this.el.find("input#popup-clock-delay")[0] as HTMLInputElement;
        this.input.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const clocks = selections
                .filter(o => o instanceof Clock)
                .map(o => o as Clock);

        // Only enable if there's exactly 1 type, so just Gates or just Muxes or just Decoders
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: number[] = [];
            clocks.forEach(c => counts.push(c.getFrequency()));

            const same = counts.every((count) => count === counts[0]);

            this.input.value = same ? counts[0].toString() : "";
            this.input.placeholder = same ? "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as Clock[];
        const countAsNumber = this.input.valueAsNumber;

        this.circuitController.addAction(new GroupAction(
            selections.map(c => new ClockFrequencyChangeAction(c, countAsNumber))
        ).execute());

        this.circuitController.render();
    }
}
