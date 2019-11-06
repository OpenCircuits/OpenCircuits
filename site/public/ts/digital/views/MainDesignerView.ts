import {DigitalCircuitView} from "./DigitalCircuitView";

export class MainDesignerView extends DigitalCircuitView {

    public constructor() {
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        super(canvas);
    }

}
