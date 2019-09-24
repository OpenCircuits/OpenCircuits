import {Tool} from "core/tools/Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "core/tools/SelectionTool";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Wire} from "core/models/Wire";
import {WirePort} from "digital/models/ioobjects/other/WirePort";

import {Action} from "core/actions/Action";
import {GroupAction} from "../../../digital/ts/actions/GroupAction";
import {SelectAction,
        CreateDeselectAllAction} from "../../../digital/ts/actions/selection/SelectAction";
import {SplitWireAction} from "../../../digital/ts/actions/addition/SplitWireAction";

export class SplitWireTool extends TranslateTool {
    private splitAction: GroupAction;

    public constructor(designer: DigitalCircuitDesigner, camera: Camera) {
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
        const wirePort = new WirePort();
        wirePort.setPos(this.camera.getWorldPos(input.getMouseDownPos()));

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
