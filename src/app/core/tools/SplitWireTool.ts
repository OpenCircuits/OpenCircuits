import {Tool} from "core/tools/Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "core/tools/SelectionTool";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {Wire} from "core/models/Wire";

import {Action} from "core/actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {SelectAction,
        CreateDeselectAllAction} from "../actions/selection/SelectAction";
import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";

export class SplitWireTool extends TranslateTool {
    private splitAction: GroupAction;

    public constructor(camera: Camera) {
        super(camera);
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag" && input.getTouchCount() == 1))
            return false;

        // Make sure we're pressing a wire
        const currentPressedObj = currentTool.getCurrentlyPressedObj();
        return (currentPressedObj instanceof Wire);
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): void {
        if (!(currentTool instanceof SelectionTool))
            throw new Error("Tool not selection tool!");

        const wire = currentTool.getCurrentlyPressedObj() as Wire;

        // Create new wire port
        const wirePort = wire.split();
        wirePort.setPos(this.camera.getWorldPos(input.getMouseDownPos()));

        // Create action
        this.splitAction = new GroupAction();

        // Set wireport as selection and being pressed
        this.splitAction.add(CreateDeselectAllAction(currentTool).execute());
        this.splitAction.add(new SelectAction(currentTool, wirePort).execute());
        this.splitAction.add(CreateSplitWireAction(wire, wirePort).execute());

        super.activate(currentTool, event, input, button, wirePort);
    }

    public deactivate(): Action {
        return new GroupAction([this.splitAction, super.deactivate()]);
    }

    // Override TranslateTool onKeyUp so that we can't duplicate the WirePorts
    public onKeyUp(): boolean {
        return false;
    }

}
