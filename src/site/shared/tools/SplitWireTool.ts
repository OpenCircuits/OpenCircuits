import {Wire} from "core/public";

import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {LEFT_MOUSE_BUTTON} from "shared/utils/input/Constants";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";

import {TranslateTool} from "./TranslateTool";


export class SplitWireTool extends TranslateTool {
    public override shouldActivate(ev: InputManagerEvent, { curPressedObj }: CircuitDesigner): boolean {
        // Activate if the user is pressing down on a wire
        return (
            ev.type === "mousedrag" &&
            ev.button === LEFT_MOUSE_BUTTON &&
            ev.state.touchCount === 1 &&
            curPressedObj?.baseKind === "Wire"
        );
    }

    public override onActivate(ev: InputManagerEvent, designer: CircuitDesigner): void {
        const { circuit, curPressedObj } = designer;

        const wire = curPressedObj! as Wire;

        // circuit.beginTransaction();

        circuit.clearSelections();
        const { node } = wire.split();
        node.select();

        // circuit.commitTransaction();

        designer.curPressedObj = node;

        super.onActivate(ev, designer);
    }
}
