import {ClampedValue} from "../ClampedValue";

import {GroupAction} from "../actions/GroupAction";
import {OutputPortChangeAction} from "../actions/ports/OutputPortChangeAction";

import {MainDesignerController} from "../../controllers/MainDesignerController";

import {Encoder} from "../../models/ioobjects/other/Encoder";

import {SelectionPopupModule} from "./SelectionPopupModule";

export class OutputCountPopupModule extends SelectionPopupModule {
    private count: HTMLInputElement;
    public constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("div#popup-output-count-text"));
        
        this.count = this.el.querySelector("input#popup-output-count");
        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const encoders = selections
                .filter(o => o instanceof Encoder)
                .map(o => o as Encoder);

        // Only enable if there's exactly 1 type, so just Gates or just Muxes or just Decoders
        const enable = selections.length > 0 && (selections.length == encoders.length);

        if (enable) {
            // Calculate output counts for each component
            const counts: Array<ClampedValue> = [];
            encoders.forEach(e => counts.push(e.getOutputPortCount()));

            const same = counts.every((count) => count.getValue() === counts[0].getValue());
            const min = counts.reduce((min, v) => Math.max(v.getMinValue(), min), -Infinity); // Find max minimum
            const max = counts.reduce((max, v) => Math.min(v.getMaxValue(), max), +Infinity); // Find min maximum

            this.count.value = same ? counts[0].getValue().toString() : "";
            this.count.placeholder = same ? "" : "-";

            this.count.min = min.toString();
            this.count.max = max.toString();
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = MainDesignerController.GetSelections();
        const countAsNumber = this.count.valueAsNumber;

        MainDesignerController.AddAction(
            selections.reduce<GroupAction>((acc, o) => {
                if (o instanceof Encoder)
                    acc.add(new OutputPortChangeAction(o, countAsNumber));
                return acc;
            }, new GroupAction()).execute()
        );

        MainDesignerController.Render();
    }
}
