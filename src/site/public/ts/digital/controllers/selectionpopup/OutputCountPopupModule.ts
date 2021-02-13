import $ from "jquery";

import {ClampedValue} from "math/ClampedValue";

import {GroupAction} from "core/actions/GroupAction";
import {CoderPortChangeAction} from "digital/actions/ports/CoderPortChangeAction";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";

import {Encoder} from "digital/models/ioobjects/other/Encoder";

import {NumberInputPopupModule} from "../../../shared/selectionpopup/NumberInputPopupModule"

export class OutputCountPopupModule extends NumberInputPopupModule {

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-output-count-text"));

        this.count = this.el.find("input#popup-output-count")[0] as HTMLInputElement;
        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const encoders = selections
                .filter(o => o instanceof Encoder) as Encoder[];

        // Only enable if there's only encoders
        const enable = selections.length > 0 && (selections.length == encoders.length);

        if (enable) {
            // Calculate output counts for each component
            const counts: ClampedValue[] = [];
            encoders.forEach(e => counts.push(e.getOutputPortCount()));

            const same = counts.every((count) => count.getValue() === counts[0].getValue());
            const min = counts.reduce((min, v) => Math.max(v.getMinValue(), min), -Infinity); // Find max minimum
            const max = counts.reduce((max, v) => Math.min(v.getMaxValue(), max), +Infinity); // Find min maximum

            this.count.value = same ? counts[0].getValue().toString() : "";
            this.count.placeholder = same ? "" : "-";
            this.previousCount = same ? counts[0].getValue() : NaN;

            this.count.min = min.toString();
            this.count.max = max.toString();
        }

        this.setEnabled(enable);
    }

    public executeChangeAction(newCount: number): void {
        const selections = this.circuitController.getSelections() as Encoder[];
        this.circuitController.addAction(new GroupAction(
            selections.map(o => new CoderPortChangeAction(o, newCount))
        ).execute());
    }
}
