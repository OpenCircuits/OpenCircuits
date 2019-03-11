import {GRID_SIZE} from "../Constants";

import {Vector} from "../math/Vector";
import {Component} from "../../models/ioobjects/Component";
import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class PositionPopupModule extends SelectionPopupModule {
    private xbox: HTMLInputElement;
    private ybox: HTMLInputElement;

    public constructor(parent_div: HTMLDivElement) {
        super(parent_div.querySelector("div#popup-pos-text"));
        this.xbox = this.div.querySelector("input#popup-position-x");
        this.ybox = this.div.querySelector("input#popup-position-y");
        this.xbox.oninput = () => this.push();
        this.ybox.oninput = () => this.push();
    }

    public pull(): void {
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

            // ""+(+x.toFixed(2)) is a hack to turn the fixed string
            //  back into a number so that trailing zeros go away
            this.xbox.value = (x == null) ? "" : ""+(+(x / GRID_SIZE - 0.5).toFixed(2));
            this.xbox.placeholder = (x == null) ? "-" : "";
            this.ybox.value = (y == null) ? "" : ""+(+(y / GRID_SIZE - 0.5).toFixed(2));
            this.ybox.placeholder = (y == null) ? "-" : "";
        } else {
            enable = false;
        }

        this.setEnabled(enable);
    }

    public push(): void {
        let selections = MainDesignerController.GetSelections().filter(o => o instanceof Component);

        selections.forEach(s => {
            let c = s as Component;
            let pos = c.getPos();

            c.setPos(new Vector(
                this.xbox.value == "" ? pos.x : GRID_SIZE * (this.xbox.valueAsNumber + 0.5),
                this.ybox.value == "" ? pos.y : GRID_SIZE * (this.ybox.valueAsNumber + 0.5),
            ));
        });
        MainDesignerController.Render();
    }
}
