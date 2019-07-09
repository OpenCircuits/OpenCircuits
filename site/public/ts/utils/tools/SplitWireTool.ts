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
import {SelectAction,
        CreateDeselectAllAction} from "../actions/selection/SelectAction";
import {SplitWireAction} from "../actions/addition/SplitWireAction";

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

        const wire = currentTool.getCurrentlyPressedObj();
        if (!(wire instanceof Wire))
            return false;

        // Create new wire port
        const wirePort = new WirePort();
        wirePort.setPos(worldMousePos);

        // Create action
        this.splitAction = new GroupAction();

        // Set wireport as selections and being pressed
        this.splitAction.add(CreateDeselectAllAction(currentTool).execute());
        this.splitAction.add(new SelectAction(currentTool, wirePort).execute());
        this.splitAction.add(new SplitWireAction(wire.getInput(), wire.getOutput(), wirePort).execute());
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
