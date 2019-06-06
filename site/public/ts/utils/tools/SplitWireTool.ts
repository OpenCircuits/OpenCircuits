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

import {Action} from "../actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {SelectAction} from "../actions/SelectAction";
import {SplitWireAction} from "../actions/SplitWireAction";

export class SplitWireTool extends TranslateTool {
    private splitAction: GroupAction;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super(designer, camera);
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;
        if (!(input.getTouchCount() == 1))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        const currentWire = currentTool.getCurrentlyPressedObj();
        if (!(currentWire instanceof Wire))
            return false;

        // Create new wire port
        const wirePort = new WirePort();
        wirePort.setPos(worldMousePos);
        this.designer.addObject(wirePort);

        // Create action
        this.splitAction = new GroupAction()

        // Set wireport as selections and being pressed
        this.splitAction.add(currentTool.clearSelections());
        currentTool.setCurrentlyPressedObj(wirePort);
        currentTool.addSelection(wirePort);
        this.splitAction.add(new SelectAction(currentTool, wirePort));

        // Store old wire's values and delete it
        const currentInput  = currentWire.getInput();
        const currentOutput = currentWire.getOutput();
        this.designer.removeWire(currentWire);

        // Create two new wires
        const wire1 = this.designer.createWire(currentInput, wirePort.getInputPort(0));
        wirePort.activate();
        const wire2 = this.designer.createWire(wirePort.getOutputPort(0), currentOutput);

        this.splitAction.add(new SplitWireAction(currentInput, wirePort, currentOutput));

        // Set control points:
        //  c1 corresponds with point 1 and c2 corresponds with point 2
        wire1.getShape().setC2(wirePort.getInputDir ().scale(DEFAULT_SIZE).add(wirePort.getPos()));
        wire2.getShape().setC1(wirePort.getOutputDir().scale(DEFAULT_SIZE).add(wirePort.getPos()));

        return super.activate(currentTool, event, input, button);
    }

    // Override TranslateTool onKeyUp so that we can't duplicate the WirePorts
    public onKeyUp(input: Input, key: number): boolean {
        return false;
    }

    public getAction(): Action {
        const group = new GroupAction();
        group.add(this.splitAction);
        group.add(super.getAction());
        return group;
    }
}
