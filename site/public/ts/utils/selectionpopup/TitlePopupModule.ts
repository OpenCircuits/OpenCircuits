import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class TitlePopupModule extends SelectionPopupModule {
    private title: HTMLInputElement;
    constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv);
        this.title = this.div.querySelector("input#popup-name");
        // oninput instead of onchange because onchange doesn't push changes when things get deselected
        this.title.oninput = () => this.push();
    }

    pull(): void {
        const selections = MainDesignerController.GetSelections();
        // * All IOObjects have a display name, so no property checks are required

        if (selections.length) {
            let same = true;
            const name = selections[0].getName();
            for (let i = 1; i < selections.length; ++i) {
                same = name == selections[i].getName();
            }

            this.title.value = same ? name : "<Multiple>";
        }
        else {
            // When this is true, it should be hidden and not matter, but cover it just in case
            this.title.value = "<None>";
        }
    }

    push(): void {
        const selections = MainDesignerController.GetSelections();
        selections.forEach(c => c.setName(this.title.value));
    }
}
