import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

import {LED} from "../../models/ioobjects/outputs/LED";

import {GroupAction} from "../actions/GroupAction";
import {ColorChangeAction} from "../actions/ColorChangeAction";

export class ColorPopupModule extends SelectionPopupModule {
    private color: HTMLInputElement;
    public constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("div#popup-color-text"));
        this.color = this.div.querySelector("input#popup-color-picker");

        this.color.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const leds = selections.filter(o => o instanceof LED).map(o => o as LED);
        const enable = selections.length == leds.length && leds.length > 0;

        if (enable) {
            const color: string = leds[0].getColor();
            let same = true;
            for (let i = 1; i < leds.length && same; ++i) {
                same = leds[i].getColor() == color;
            }

            this.color.value = same ? color : "#cccccc";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = MainDesignerController.GetSelections();
        const targetColor = this.color.value;

        MainDesignerController.AddAction(
            selections.reduce<GroupAction>((acc, o) => {
                if (o instanceof LED)
                    acc.add(new ColorChangeAction(o, targetColor));
                return acc;
            }, new GroupAction()).execute()
        );

        MainDesignerController.Render();
    }
}
