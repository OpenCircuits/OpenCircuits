import {CreateBusAction} from "../actions/addition/BusActionFactory";

import {InputPort} from "../../models/ports/InputPort";
import {OutputPort} from "../../models/ports/OutputPort";

import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class BusButtonPopupModule extends SelectionPopupModule {
    private button: HTMLButtonElement;

    public constructor(parentDiv: HTMLDivElement) {
        // No wrapping div
        super(parentDiv);
        this.button = this.div.querySelector("button#popup-bus-button");
        this.button.onclick = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();

        // Make sure there are no regular selections
        if (selections.length > 0) {
            this.button.style.display = "none";
            return;
        }

        const portSelections = MainDesignerController.GetPortSelections();

        const inputPorts  = portSelections.filter(o => o instanceof InputPort);
        const outputPorts = portSelections.filter(o => o instanceof OutputPort);

        // Check if we have equal amount of input and output ports
        const enable = (inputPorts.length == outputPorts.length);

        // Enable/disable the button
        this.button.style.display = (enable ? "inherit" : "none");
    }

    public push(): void {
        const selections = MainDesignerController.GetPortSelections();

        const inputPorts  = <Array<InputPort>> selections.filter(o => o instanceof InputPort);
        const outputPorts = <Array<OutputPort>>selections.filter(o => o instanceof OutputPort);

        MainDesignerController.AddAction(
            CreateBusAction(outputPorts, inputPorts).execute()
        );

        MainDesignerController.Render();
    }
}
