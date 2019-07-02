import {Component} from "../../models/ioobjects/Component";
import {ICData} from "../../models/ioobjects/other/ICData";
import {MainDesignerController} from "../../controllers/MainDesignerController";
import {ICDesignerController} from "../../controllers/ICDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class ICButtonPopupModule extends SelectionPopupModule {
    private button: HTMLButtonElement;

    public constructor(parentDiv: HTMLDivElement) {
        // No wrapping div
        super(parentDiv);
        this.button = this.div.querySelector("button#popup-ic-button");
        this.button.onclick = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const componentSelections = selections.filter(o => o instanceof Component) as Array<Component>;
        if (componentSelections.length != selections.length) {
            this.button.style.display = "none";
            return;
        }

        // Check if the selections are a valid IC
        const enable = ICData.IsValid(componentSelections);

        // Enable/disable the button
        this.button.style.display = (enable ? "inherit" : "none");
    }

    public push(): void {
        ICDesignerController.Show(MainDesignerController.GetSelections() as Array<Component>);
    }
}
