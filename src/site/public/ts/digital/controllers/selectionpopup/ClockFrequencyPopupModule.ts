import $ from "jquery";

import {GroupAction} from "core/actions/GroupAction";
import {ClockFrequencyChangeAction} from "digital/actions/ClockFrequencyChangeAction";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";

import {Clock} from "digital/models/ioobjects/inputs/Clock";

import {NumberInputPopupModule} from "../../../shared/selectionpopup/NumberInputPopupModule"

export class ClockFrequencyPopupModule extends NumberInputPopupModule {

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-clock-delay-text"));

        this.count = this.el.find("input#popup-clock-delay")[0] as HTMLInputElement;
        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const clocks = selections
                .filter(o => o instanceof Clock)
                .map(o => o as Clock);

        // Only enable if there's only clocks
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: number[] = [];
            clocks.forEach(c => counts.push(c.getFrequency()));

            const same = counts.every((count) => count === counts[0]);

            this.count.value = same ? counts[0].toString() : "";
            this.count.placeholder = same ? "" : "-";
            this.previousCount = same ? counts[0] : NaN;
        }

        this.setEnabled(enable);
    }

    public executeChangeAction(newCount: number): void {
        const selections = this.circuitController.getSelections() as Clock[];
        this.circuitController.addAction(new GroupAction(
            selections.map(c => new ClockFrequencyChangeAction(c, newCount))
        ).execute());
    }
}
