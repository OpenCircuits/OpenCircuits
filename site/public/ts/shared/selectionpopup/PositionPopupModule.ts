import $ from "jquery";

import {GRID_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {Component} from "core/models/Component";
import {MainDesignerController} from "../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";

export class PositionPopupModule extends SelectionPopupModule {
    private xbox: HTMLInputElement;
    private ybox: HTMLInputElement;

    public constructor(circuitController: MainDesignerController) {
        super(circuitController, $("div#popup-pos-text"));

        this.xbox = this.el.find("input#popup-position-x")[0] as HTMLInputElement;
        this.ybox = this.el.find("input#popup-position-y")[0] as HTMLInputElement;
        this.xbox.oninput = () => this.push();
        this.ybox.oninput = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const components = selections.filter(o => o instanceof Component) as Component[];
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
        const components = this.circuitController.getSelections() as Component[];

        this.circuitController.addAction(CreateGroupTranslateAction(components, components
                .map(c => V(this.xbox.value == "" ? c.getPos().x : GRID_SIZE * (this.xbox.valueAsNumber + 0.5),
                            this.ybox.value == "" ? c.getPos().y : GRID_SIZE * (this.ybox.valueAsNumber + 0.5)))
        ).execute());

        this.circuitController.render();
    }
}
