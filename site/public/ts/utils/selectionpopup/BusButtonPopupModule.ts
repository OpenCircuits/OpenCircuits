import {GroupAction} from "../actions/GroupAction";
import {ConnectionAction} from "../actions/addition/ConnectionAction";

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
        const designer = MainDesignerController.GetDesigner();
        const selections = MainDesignerController.GetPortSelections();

        const inputPorts  = <Array<InputPort>> selections.filter(o => o instanceof InputPort);
        const outputPorts = <Array<OutputPort>>selections.filter(o => o instanceof OutputPort);

        const group = new GroupAction();

        // Connect closest pairs of input and output ports
        while (outputPorts.length > 0) {
            // Find closest pair of input and output ports
            const max = {dist: -Infinity, in: undefined as InputPort, out: undefined as OutputPort};
            outputPorts.forEach((outPort) => {

                // Find the closest input port
                const min = {dist: Infinity, in: undefined as InputPort};
                inputPorts.forEach((inPort) => {
                    // Calculate distance between target pos of ports
                    const dist = outPort.getWorldTargetPos().distanceTo(inPort.getWorldTargetPos());
                    if (dist < min.dist) {
                        min.dist = dist;
                        min.in = inPort;
                    }
                });

                if (min.dist > max.dist) {
                    max.dist = min.dist;
                    max.in = min.in;
                    max.out = outPort;
                }
            });

            // Attach the ports
            const wire = designer.createWire(max.out, max.in);
            // wire.setAsStraight(true); @TODO

            // Add action
            group.add(new ConnectionAction(wire));

            // Remove ports from array
            inputPorts.splice(inputPorts.indexOf(max.in), 1);
            outputPorts.splice(outputPorts.indexOf(max.out), 1);
        }

        MainDesignerController.AddAction(group);

        MainDesignerController.Render();
    }
}
