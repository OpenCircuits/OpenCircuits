import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";
import {Component} from "../../models/ioobjects/Component";
import {Gate} from "../../models/ioobjects/gates/Gate";
import {BUFGate} from "../../models/ioobjects/gates/BUFGate";

export class InputPortCountPopupModule extends SelectionPopupModule {
    private count: HTMLInputElement;
    constructor(parent_div: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parent_div.querySelector("div#popup-input-count-text"));
        this.count = this.div.querySelector("input#popup-input-count");

        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const components = selections.filter(o => {
            o instanceof Gate &&
            !(o instanceof BUFGate)
        }).map(o => o as Component);
        let enable = selections.length == components.length && components.length > 0;

        if (enable) {
            let same = true;
            let count: number = components[0].getInputPortCount();
            for (let i = 1; i < components.length && same; ++i) {
                same = components[i].getInputPortCount() == count;
            }

            this.count.value = same ? count.toString() : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        let components = MainDesignerController.GetSelections().filter(o => {
            o instanceof Gate &&
            !(o instanceof BUFGate)
        }).map(o => o as Component);

        let countAsNumber = this.count.valueAsNumber;
        components.forEach(c =>
            c.setInputPortCount(countAsNumber)
        );
        MainDesignerController.Render();
    }
}