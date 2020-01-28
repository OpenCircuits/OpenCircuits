import {DigitalCircuitView} from "./DigitalCircuitView";

export class ICDesignerView extends DigitalCircuitView {
    private div: HTMLDivElement;
    private nameInput: HTMLInputElement;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;

    public constructor() {
        const canvas = document.getElementById("ic-canvas");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        super(canvas, 0.84, 0.76);

        // Get HTML elements
        const div = document.getElementById("ic-designer");
        if (!(div instanceof HTMLDivElement))
            throw new Error("IC Designer DIV element not found!");

        const input = document.getElementById("ic-name-input");
        if (!(input instanceof HTMLInputElement))
            throw new Error("IC Designer name input element not found!");

        const confirmButton = document.getElementById("ic-confirmbutton");
        if (!(confirmButton instanceof HTMLButtonElement))
            throw new Error("IC Confirm Button element not found!");

        const cancelButton = document.getElementById("ic-cancelbutton");
        if (!(cancelButton instanceof HTMLButtonElement))
            throw new Error("IC Cancel Button element not found!");

        this.div = div;
        this.nameInput = input;
        this.confirmButton = confirmButton;
        this.cancelButton  = cancelButton;

        this.hide();
    }

    public setCursor(cursor: string): void {
        this.renderer.setCursor(cursor);
    }

    public show(): void {
        this.div.classList.remove("invisible");
    }

    public setConfirmButtonListener(listener: () => void): void {
        this.confirmButton.onclick = () => listener();
    }

    public setCancelButtonListener(listener: () => void): void {
        this.cancelButton.onclick = () => listener();
    }

    public setOnNameChangeListener(listener: (name: string) => void): void {
        this.nameInput.onchange = () => listener(this.nameInput.value);
    }

    public clearName(): void {
        this.nameInput.value = "";
    }

    public hide(): void {
        this.div.classList.add("invisible");
    }

}
