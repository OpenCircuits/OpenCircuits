import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";
import {Gate} from "../../models/ioobjects/gates/Gate";
import {BUFGate} from "../../models/ioobjects/gates/BUFGate";
import {Decoder} from "../../models/ioobjects/other/Decoder";
import {Mux} from "../../models/ioobjects/other/Mux";
import {GroupAction} from "../actions/GroupAction";
import {InputPortChangeAction} from "../actions/ports/InputPortChangeAction";
import {SelectPortChangeAction} from "../actions/ports/SelectPortChangeAction";

export class InputCountPopupModule extends SelectionPopupModule {
    private count: HTMLInputElement;
    constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("div#popup-input-count-text"));
        this.count = this.div.querySelector("input#popup-input-count");

        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const gates = selections
             .filter(o => o instanceof Gate && !(o instanceof BUFGate))
             .map(o => o as Gate);
        const muxes = selections
             .filter(o => o instanceof Mux)
             .map(o => o as Mux);
        const decos = selections
             .filter(o => o instanceof Decoder)
             .map(o => o as Decoder);

        const enable = selections.length == gates.length + muxes.length + decos.length && selections.length > 0;

        if (enable) {
            // Calculate input counts for each component
            const counts: Array<number> = [];
            gates.forEach(g => counts.push(g.getInputPortCount()));
            muxes.forEach(m => counts.push(m.getSelectPortCount()));
            decos.forEach(d => counts.push(d.getInputPortCount()));

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
                if (o instanceof Gate && !(o instanceof BUFGate))
                    acc.add(new InputPortChangeAction(o,  countAsNumber));
                else if (o instanceof Mux)
                    acc.add(new SelectPortChangeAction(o, countAsNumber));
                else if (o instanceof Decoder)
                    acc.add(new InputPortChangeAction(o,  countAsNumber));
                return acc;
            }, new GroupAction()).execute()
        );

        MainDesignerController.Render();
    }
}
