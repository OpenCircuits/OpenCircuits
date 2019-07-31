import {GroupAction} from "../actions/GroupAction";
import {ClockFrequencyChangeAction} from "../actions/ClockFrequencyChangeAction";

import {MainDesignerController} from "../../controllers/MainDesignerController";

import {Clock} from "../../models/ioobjects/inputs/Clock";

import {SelectionPopupModule} from "./SelectionPopupModule";

export class ClockFrequencyPopupModule extends SelectionPopupModule {
    private input: HTMLInputElement;
    public constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("div#popup-clock-delay-text"));

        this.input = this.el.querySelector("input#popup-clock-delay");
        this.input.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const clocks = selections
                .filter(o => o instanceof Clock)
                .map(o => o as Clock);

        // Only enable if there's exactly 1 type, so just Gates or just Muxes or just Decoders
        const enable = selections.length > 0 && (selections.length == clocks.length);

        if (enable) {
            // Calculate input counts for each component
            const counts: Array<number> = [];
            clocks.forEach(c => counts.push(c.getFrequency()));

            const same = counts.every((count) => count === counts[0]);

            this.input.value = same ? counts[0].toString() : "";
            this.input.placeholder = same ? "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = MainDesignerController.GetSelections();
        const countAsNumber = this.input.valueAsNumber;

        MainDesignerController.AddAction(
            selections.reduce<GroupAction>((acc, o) => {
                if (o instanceof Clock)
                    acc.add(new ClockFrequencyChangeAction(o, countAsNumber));
                return acc;
            }, new GroupAction()).execute()
        );

        MainDesignerController.Render();
    }
}
