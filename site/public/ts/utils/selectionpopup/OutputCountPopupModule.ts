import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";
import {Component} from "../../models/ioobjects/Component";

export class OutputCountPopupModule extends SelectionPopupModule {
    private count: HTMLInputElement;
    constructor(parent_div: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parent_div.querySelector("div#popup-output-count-text"));
        this.count = this.div.querySelector("input#popup-output-count");

        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        let encoders = selections
            .filter(_ => false) // TODO: implement when encoders are added to the typescript build
            .map(o => o as Component);

        let counts: Array<number> = [];
        encoders.forEach(g => counts.push(g.getOutputPortCount()));

        let enable = selections.length == encoders.length && selections.length > 0;
        if (enable) {
            let same = true;
            let count: number = counts[0];
            for (let i = 1; i < counts.length && same; ++i) {
                same = counts[i] == count;
            }

            this.count.value = same ? count.toString() : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        let encoders = MainDesignerController.GetSelections()
            .filter(_ => false) // TODO: implement when encoders are added to the typescript build
            .map(o => o as Component);

        let countAsNumber = this.count.valueAsNumber;
        encoders.forEach(e =>
            e.setOutputPortCount(countAsNumber)
        );
        MainDesignerController.Render();
    }
}
