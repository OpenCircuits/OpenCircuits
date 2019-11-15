import {AnalogCircuitView} from "./AnalogCircuitView";

export class MainDesignerView extends AnalogCircuitView {

    public constructor() {
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        super(canvas);
    }

}
