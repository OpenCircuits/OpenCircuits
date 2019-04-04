import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";
import {LED} from "../../models/ioobjects/outputs/LED";

export class ColorPopupModule extends SelectionPopupModule {
    private color: HTMLInputElement;
    constructor(parent_div: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parent_div.querySelector("div#popup-color-text"));
        this.color = this.div.querySelector("input#popup-color-picker");

        this.color.onchange = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const leds = selections.filter(o => o instanceof LED).map(o => o as LED);
        let enable = selections.length == leds.length && leds.length > 0;

        if (enable) {
            let same = true;
            let color: string = leds[0].getColor();
            for (let i = 1; i < leds.length && same; ++i) {
                same = leds[i].getColor() == color;
            }

            this.color.value = same ? color : "#cccccc";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        let leds = MainDesignerController.GetSelections().filter(o => o instanceof LED).map(o => o as LED);

        leds.forEach(l =>
            l.setColor(this.color.value)
        );
        MainDesignerController.Render();
    }
}