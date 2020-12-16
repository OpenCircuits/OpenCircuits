import $ from "jquery";

import {AnalogCircuitView} from "./AnalogCircuitView";

export class MainDesignerView extends AnalogCircuitView {

    public constructor() {
        const canvas = $("#canvas")[0];
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        super(canvas, 1, 1, 0, -$("#header").outerHeight());
    }

}
