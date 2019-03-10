import {Component} from "../../models/ioobjects/Component";
import {ICData} from "../../models/ioobjects/other/ICData";
import {MainDesignerController} from "../../controllers/MainDesignerController";
import {ICDesignerController} from "../../controllers/ICDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class ICButtonPopupModule extends SelectionPopupModule {
    private button: HTMLButtonElement;

    public constructor(parent_div: HTMLDivElement) {
        // No wrapping div
        super(parent_div);
        this.button = this.div.querySelector("button#popup-ic-button");
        this.button.onclick = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections().filter(o => o instanceof Component);

        // Check if the selections are a valid IC
        let enable = ICData.IsValid(selections);

        // Enable/disable the button
        this.button.style.display = (enable ? "inherit" : "none");
    }

    public push(): void {
        ICDesignerController.Show(MainDesignerController.GetSelections());
    }
}
