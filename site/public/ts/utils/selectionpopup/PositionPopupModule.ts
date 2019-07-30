import {GRID_SIZE} from "../Constants";

import {V} from "../math/Vector";
import {Component} from "../../models/ioobjects/Component";
import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

import {CreateGroupTranslateAction} from "../actions/transform/TranslateAction";

export class PositionPopupModule extends SelectionPopupModule {
    private xbox: HTMLInputElement;
    private ybox: HTMLInputElement;

    public constructor(parentDiv: HTMLDivElement) {
        super(parentDiv.querySelector("div#popup-pos-text"));

        this.xbox = this.el.querySelector("input#popup-position-x");
        this.ybox = this.el.querySelector("input#popup-position-y");
        this.xbox.oninput = () => this.push();
        this.ybox.oninput = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const components = selections.filter(o => o instanceof Component).map(o => o as Component);
        const enable = selections.length == components.length && components.length > 0;

        if (enable) {
            let x: number = components[0].getPos().x;
            let y: number = components[0].getPos().y;

            for (let i = 1; i < components.length && x != null && y != null; ++i) {
                const c = components[i];
                const pos = c.getPos();
                if (pos.x != x || pos.y != y) x = y = null;
            }

            // ""+(+x.toFixed(2)) is a hack to turn the fixed string
            //  back into a number so that trailing zeros go away
            this.xbox.value = (x == null) ? "" : ""+(+(x / GRID_SIZE - 0.5).toFixed(2));
            this.xbox.placeholder = (x == null) ? "-" : "";
            this.ybox.value = (y == null) ? "" : ""+(+(y / GRID_SIZE - 0.5).toFixed(2));
            this.ybox.placeholder = (y == null) ? "-" : "";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const components = MainDesignerController.GetSelections().filter(o => o instanceof Component).map(o => o as Component);

        MainDesignerController.AddAction(
            CreateGroupTranslateAction(components,
                                       components.map((c) =>
                                           V(this.xbox.value == "" ? c.getPos().x : GRID_SIZE * (this.xbox.valueAsNumber + 0.5),
                                             this.ybox.value == "" ? c.getPos().y : GRID_SIZE * (this.ybox.valueAsNumber + 0.5))
                                       )).execute()
        );

        MainDesignerController.Render();
    }
}
