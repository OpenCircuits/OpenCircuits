import $ from "jquery";

import {Component} from "core/models/Component";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {MainDesignerController} from "../../shared/controllers/MainDesignerController";
import {ICDesignerController} from "../controllers/ICDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class ICButtonPopupModule extends SelectionPopupModule {
    private icController: ICDesignerController;

    public constructor(circuitController: MainDesignerController, icController: ICDesignerController) {
        // No wrapping div
        super(circuitController, $("button#popup-ic-button"));
        this.icController = icController;

        this.el.click(() => this.push());
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const componentSelections = selections.filter(o => o instanceof Component) as Component[];
        if (componentSelections.length != selections.length) {
            this.setEnabled(false);
            return;
        }

        // Check if the selections are a valid IC
        const enable = ICData.IsValid(componentSelections);

        // Enable/disable the button
        this.setEnabled(enable);
    }

    public push(): void {
        this.icController.show(this.circuitController.getSelections() as Component[]);
    }
}
