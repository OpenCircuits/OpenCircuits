import $ from "jquery";

import {DigitalCircuitView} from "./DigitalCircuitView";

export class MainDesignerView extends DigitalCircuitView {

    public constructor() {
        const canvas = $("#canvas")[0];
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        super(canvas, 1, 1, 0, -$("#header").outerHeight());
    }

}
