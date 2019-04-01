import {DEFAULT_SIZE} from "../Constants";

import {BezierContains} from "../math/MathUtils";

import {Tool} from "./Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "./SelectionTool";

import {Input} from "../Input";
import {Camera} from "../Camera";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {WirePort} from "../../models/ioobjects/other/WirePort";

import {Action} from "../actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {SelectAction} from "../actions/SelectAction";
import {SplitWireAction} from "../actions/SplitWireAction";

export class SplitWireTool extends TranslateTool {

    private designer: CircuitDesigner;

    private action: GroupAction;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super(camera);

        this.designer = designer;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Go through every wire and check to see if it has been pressed
        let currentWire;
        for (let w of this.designer.getWires()) {
            if (BezierContains(w.getShape(), worldMousePos)) {
                currentWire = w;
                break;
            }
        }

        if (!currentWire)
            return false;

        // Create new wire port
        const wirePort = new WirePort();
        wirePort.setPos(worldMousePos);
        this.designer.addObject(wirePort);

        // Create action
        this.action = new GroupAction()

        // Set wireport as selections and being pressed
        this.action.add(currentTool.clearSelections());
        currentTool.setCurrentlyPressedObj(wirePort);
        currentTool.addSelection(wirePort);
        this.action.add(new SelectAction(currentTool, wirePort));

        // Store old wire's values and delete it
        const currentInput  = currentWire.getInput();
        const currentOutput = currentWire.getOutput();
        this.designer.removeWire(currentWire);

        // Create two new wires
        const wire1 = this.designer.createWire(currentInput, wirePort.getInputPort(0));
        const wire2 = this.designer.createWire(wirePort.getOutputPort(0), currentOutput);

        this.action.add(new SplitWireAction(currentInput, wirePort, currentOutput));

        // Set control points:
        //  c1 corresponds with point 1 and c2 corresponds with point 2
        wire1.getShape().setC2(wirePort.getInputDir ().scale(DEFAULT_SIZE).add(wirePort.getPos()));
        wire2.getShape().setC1(wirePort.getOutputDir().scale(DEFAULT_SIZE).add(wirePort.getPos()));

        return super.activate(currentTool, event, input, button);
    }

    public getAction(): Action {
        const group = new GroupAction();
        group.add(this.action);
        group.add(super.getAction());
        return group;
    }
}
