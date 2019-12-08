import {DigitalCircuitView} from "./DigitalCircuitView";
import $ from "jquery";

export class ICViewerView extends DigitalCircuitView {
    private div: HTMLDivElement;
    private closeButton: HTMLButtonElement;

    public constructor() {
        const canvas = $("canvas#icviewer-canvas")[0];
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("IC Viewer Canvas element not found!");
        super(canvas, 0.84, 0.76);

        // Get HTML elements
        const div = $("div#ic-viewer")[0];
        if (!(div instanceof HTMLDivElement))
            throw new Error("IC Viewer DIV element not found!");

        const closeButton = $("button#icviewer-closebutton")[0];
        if (!(closeButton instanceof HTMLButtonElement))
            throw new Error("IC Viewer Close Button element not found!");

        this.div = div;
        this.closeButton = closeButton;

        this.hide();
    }

    public setCursor(cursor: string): void {
        this.renderer.setCursor(cursor);
    }

    public show(): void {
        this.div.classList.remove("invisible");
    }

    public setCloseButtonListener(listener: () => void): void {
        this.closeButton.onclick = () => listener();
    }

    public hide(): void {
        this.div.classList.add("invisible");
    }

}
