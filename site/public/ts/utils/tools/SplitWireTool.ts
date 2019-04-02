import {DEFAULT_SIZE} from "../Constants";

import {BezierContains} from "../math/MathUtils";

import {Tool} from "./Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "./SelectionTool";

import {Input} from "../Input";
import {Camera} from "../Camera";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Wire} from "../../models/ioobjects/Wire";
import {WirePort} from "../../models/ioobjects/other/WirePort";

export class SplitWireTool extends TranslateTool {

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super(designer, camera);
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        const currentWire = currentTool.getCurrentlyPressedObj();
        if (!(currentWire instanceof Wire))
            return false;

        // Create new wire port
        const wirePort = new WirePort();
        wirePort.setPos(worldMousePos);
        this.designer.addObject(wirePort);

        // Set wireport as selections and being pressed
        currentTool.clearSelections();
        currentTool.setCurrentlyPressedObj(wirePort);
        currentTool.addSelection(wirePort);

        // Store old wire's values and delete it
        const currentInput  = currentWire.getInput();
        const currentOutput = currentWire.getOutput();
        this.designer.removeWire(currentWire);

        // Create two new wires
        const wire1 = this.designer.createWire(currentInput, wirePort.getInputPort(0));
        const wire2 = this.designer.createWire(wirePort.getOutputPort(0), currentOutput);

        // Set control points:
        //  c1 corresponds with point 1 and c2 corresponds with point 2
        wire1.getShape().setC2(wirePort.getInputDir ().scale(DEFAULT_SIZE).add(wirePort.getPos()));
        wire2.getShape().setC1(wirePort.getOutputDir().scale(DEFAULT_SIZE).add(wirePort.getPos()));

        return super.activate(currentTool, event, input, button);
    }
}
