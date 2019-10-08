import {Tool} from "core/tools/Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "core/tools/SelectionTool";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Wire} from "core/models/Wire";
import {Node} from "core/models/Node";

import {Action} from "core/actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {SelectAction,
        CreateDeselectAllAction} from "../actions/selection/SelectAction";
import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";

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

        const wire = currentTool.getCurrentlyPressedObj();
        if (!(wire instanceof Wire))
            return false;

        // Create new wire port
        const wirePort = wire.split();
        wirePort.setPos(this.camera.getWorldPos(input.getMouseDownPos()));

        // Create action
        this.splitAction = new GroupAction();

        // Set wireport as selections and being pressed
        this.splitAction.add(CreateDeselectAllAction(currentTool).execute());
        this.splitAction.add(new SelectAction(currentTool, wirePort).execute());
        this.splitAction.add(CreateSplitWireAction(wire, wirePort).execute());
        currentTool.setCurrentlyPressedObj(wirePort);

        return super.activate(currentTool, event, input, button);
    }

    // Override TranslateTool onKeyUp so that we can't duplicate the WirePorts
    public onKeyUp(): boolean {
        return false;
    }

    public getAction(): Action {
        const group = new GroupAction();
        group.add(this.splitAction);
        group.add(super.getAction());
        return group;
    }
}
