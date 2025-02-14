import {Wire} from "shared/api/circuit/public";

import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {LEFT_MOUSE_BUTTON} from "shared/src/utils/input/Constants";
import {InputAdapterEvent} from "shared/src/utils/input/InputAdapterEvent";

import {TranslateTool} from "./TranslateTool";


export class SplitWireTool extends TranslateTool {
    public override shouldActivate(ev: InputAdapterEvent, { curPressedObj }: CircuitDesigner): boolean {
        // Activate if the user is pressing down on a wire
        return (
            ev.type === "mousedrag" &&
            ev.button === LEFT_MOUSE_BUTTON &&
            ev.input.touchCount === 1 &&
            curPressedObj?.baseKind === "Wire"
        );
    }

    public override onActivate(ev: InputAdapterEvent, designer: CircuitDesigner): void {
        const { circuit, curPressedObj } = designer;

        const wire = curPressedObj! as Wire;

        circuit.beginTransaction();

        circuit.selections.clear();
        const { node } = wire.split();
        node.select();

        designer.curPressedObj = node;

        super.onActivate(ev, designer);

        circuit.commitTransaction();
    }
}
