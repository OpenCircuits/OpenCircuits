import $ from "jquery";

import {MainDesignerController} from "../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class TitlePopupModule extends SelectionPopupModule {
    private title: JQuery<HTMLInputElement>;

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("input#popup-name"));

        this.title = this.el as JQuery<HTMLInputElement>;
        // oninput instead of onchange because onchange doesn't push changes when things get deselected
        this.title.on("input", () => this.push());
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        // * All IOObjects have a display name, so no property checks are required
        if (selections.length == 0)
            return;

        const name = selections[0].getName();
        const same = selections.every((s) => s.getName() == name);

        this.title.val(same ? name : "<Multiple>");
    }

    public push(): void {
        const selections = this.circuitController.getSelections();
        selections.forEach(c => c.setName(this.title.val() as string));
    }
}
