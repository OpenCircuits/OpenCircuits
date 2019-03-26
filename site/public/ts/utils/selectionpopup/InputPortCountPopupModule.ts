import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";
import {Component} from "../../models/ioobjects/Component";
import {Gate} from "../../models/ioobjects/gates/Gate";
import {BUFGate} from "../../models/ioobjects/gates/BUFGate";
import {Multiplexer} from "../../models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "../../models/ioobjects/other/Demultiplexer";

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
        let gates = MainDesignerController.GetSelections()
            .filter(o => o instanceof Gate && !(o instanceof BUFGate))
            .map(o => o as Gate);
        let muxers = MainDesignerController.GetSelections()
            .filter(o => o instanceof Multiplexer)
            .map(o => o as Multiplexer);
        let demuxers = MainDesignerController.GetSelections()
            .filter(o => o instanceof Demultiplexer)
            .map(o => o as Demultiplexer);

        let enable = selections.length == gates.length + muxers.length + demuxers.length && selections.length > 0;

        let counts: Array<number> = [];
        gates.forEach(g => counts.push(g.getInputPortCount()));
        muxers.forEach(m => counts.push(m.getTargetInputPortCount()));
        demuxers.forEach(d => counts.push(d.getInputPortCount() - 1));

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
        let gates = MainDesignerController.GetSelections()
            .filter(o => o instanceof Gate && !(o instanceof BUFGate))
            .map(o => o as Gate);
        let muxers = MainDesignerController.GetSelections()
            .filter(o => o instanceof Multiplexer)
            .map(o => o as Multiplexer);
        let demuxers = MainDesignerController.GetSelections()
            .filter(o => o instanceof Demultiplexer)
            .map(o => o as Demultiplexer);

        let countAsNumber = this.count.valueAsNumber;
        gates.forEach(g =>
            g.setInputPortCount(countAsNumber)
        );
        muxers.forEach(m =>
            m.setInputPortCount(countAsNumber)
        );
        demuxers.forEach(d =>
            d.setInputPortCount(countAsNumber)
        );
        MainDesignerController.Render();
    }
}