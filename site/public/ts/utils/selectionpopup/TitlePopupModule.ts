import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class TitlePopupModule extends SelectionPopupModule {
    private title: HTMLInputElement;

    public constructor(parentDiv: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parentDiv.querySelector("input#popup-name"));

        this.title = this.el as HTMLInputElement;
        // oninput instead of onchange because onchange doesn't push changes when things get deselected
        this.title.oninput = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        // * All IOObjects have a display name, so no property checks are required
        if (selections.length == 0)
            return;

        const name = selections[0].getName();
        const same = selections.every((s) => s.getName() == name);

        this.title.value = same ? name : "<Multiple>";
    }

    public push(): void {
        const selections = MainDesignerController.GetSelections();
        selections.forEach(c => c.setName(this.title.value));
    }
}
