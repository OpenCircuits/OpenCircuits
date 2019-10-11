import $ from "jquery";

import {CreateBusAction} from "digital/actions/addition/BusActionFactory";

import {Port} from "core/models/ports/Port";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

import {MainDesignerController} from "../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "./SelectionPopupModule";

export class BusButtonPopupModule extends SelectionPopupModule {

    public constructor(circuitController: MainDesignerController) {
        super(circuitController, $("button#popup-bus-button"));

        this.el.click(() => this.push());
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const portSelections = selections.filter((o) => o instanceof Port) as Port[];

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
        const selections = this.circuitController.getSelections();
        const portSelections = selections.filter((o) => o instanceof Port) as Port[];

        const inputPorts  = <InputPort[]> portSelections.filter(o => o instanceof InputPort);
        const outputPorts = <OutputPort[]>portSelections.filter(o => o instanceof OutputPort);

        this.circuitController.addAction(
            CreateBusAction(outputPorts, inputPorts).execute()
        );

        this.circuitController.render();
    }
}
