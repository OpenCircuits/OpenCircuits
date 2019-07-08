import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

import {Encoder} from "../../models/ioobjects/other/Encoder";

import {GroupAction} from "../actions/GroupAction";
import {OutputPortChangeAction} from "../actions/ports/OutputPortChangeAction";

export class OutputCountPopupModule extends SelectionPopupModule {
    private count: HTMLInputElement;
    public constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("div#popup-output-count-text"));
        this.count = this.div.querySelector("input#popup-output-count");

        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const encoders = selections
              .filter(o => o instanceof Encoder)
              .map(o => o as Encoder);

        const enable = selections.length == encoders.length && selections.length > 0;

        if (enable) {
            // Calculate output counts for each component
            const counts: Array<number> = [];
            encoders.forEach(e => counts.push(e.getOutputPortCount()));

            const same = counts.every((count) => count === counts[0]);

            this.count.value = same ? counts[0].toString() : "-";
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
