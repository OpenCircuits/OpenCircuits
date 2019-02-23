import {Vector} from "../math/Vector";
import {Component} from "../../models/ioobjects/Component";
import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class PositionPopupModule extends SelectionPopupModule {
    private xbox: HTMLInputElement;
    private ybox: HTMLInputElement;

    constructor(parent_div: HTMLDivElement) {
        super(parent_div.querySelector("div#popup-pos-text"));
        this.xbox = this.div.querySelector("input#popup-position-x");
        this.ybox = this.div.querySelector("input#popup-position-y");
        this.xbox.onchange = () => this.push();
        this.ybox.onchange = () => this.push();
    }

    pull(): void {
        const selections = MainDesignerController.GetSelections().filter(o => o instanceof Component);
        let enable = true;

        if (selections.length) {
            let x: number = null;
            let y: number = null;

            const s0 = selections[0];
            if (s0 instanceof Component) {
                const pos = s0.getPos();
                x = pos.x;
                y = pos.y;
            }

            for (let i = 1; i < selections.length && x != null && y != null; ++i) {
                const s = selections[i];
                if (s instanceof Component) {
                    const pos = s.getPos();
                    if (pos.x != x || pos.y != y) x = y = null;
                } else {
                    x = y = null;
                    enable = false;
                }
            }

            this.xbox.value = (x == null) ? "" : x.toFixed(2);
            this.ybox.value = (x == null) ? "" : y.toFixed(2);
        } else {
            enable = false;
        }

        this.setEnabled(enable);
    }

    push(): void {
        let selections = MainDesignerController.GetSelections().filter(o => o instanceof Component);

        selections.forEach(s => {
            let c = s as Component;
            let pos = c.getPos();

            c.setPos(new Vector(
                this.xbox.value == "" ? pos.x : this.xbox.valueAsNumber,
                this.xbox.value == "" ? pos.y : this.ybox.valueAsNumber,
            ));
        });
        MainDesignerController.Render();
    }
}