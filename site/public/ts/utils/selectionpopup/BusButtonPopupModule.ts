import {CreateBusAction} from "../actions/addition/BusActionFactory";

import {Port} from "../../models/ports/Port";
import {InputPort} from "../../models/ports/InputPort";
import {OutputPort} from "../../models/ports/OutputPort";

import {MainDesignerController} from "../../controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class BusButtonPopupModule extends SelectionPopupModule {
    public constructor(parentDiv: HTMLDivElement) {
        // No wrapping div
        super(parentDiv.querySelector("button#popup-bus-button"));
        this.el.onclick = () => this.push();
    }

    public pull(): void {
        const selections = MainDesignerController.GetSelections();
        const portSelections = selections.filter((o) => o instanceof Port) as Array<Port>;

        // Make sure there are no regular selections
        if (portSelections.length != selections.length) {
            this.setEnabled(false);
            return;
        }

        const inputPorts  = portSelections.filter(o => o instanceof InputPort);
        const outputPorts = portSelections.filter(o => o instanceof OutputPort);

        // Check if we have equal amount of input and output ports
        const enable = (inputPorts.length == outputPorts.length);

        // Enable/disable the button
        this.setEnabled(enable);
    }

    public push(): void {
        const selections = MainDesignerController.GetSelections();
        const portSelections = selections.filter((o) => o instanceof Port) as Array<Port>;

        const inputPorts  = <Array<InputPort>> portSelections.filter(o => o instanceof InputPort);
        const outputPorts = <Array<OutputPort>>portSelections.filter(o => o instanceof OutputPort);

        MainDesignerController.AddAction(
            CreateBusAction(outputPorts, inputPorts).execute()
        );

        MainDesignerController.Render();
    }
}
