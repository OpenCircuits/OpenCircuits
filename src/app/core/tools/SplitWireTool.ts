import {v4 as uuid} from "uuid";

import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {CircuitInfo}       from "core/utils/CircuitInfo";
import {CalcWorldMousePos} from "core/utils/CircuitInfoUtils";
import {InputManagerEvent} from "core/utils/InputManager";
import {SnapToGrid}        from "core/utils/SnapUtils";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetPos} from "core/actions/compositions/SetTransform";

import {DeselectAll, Select} from "core/actions/units/Select";
import {Split}               from "core/actions/units/Split";

import {Tool} from "core/tools/Tool";

import {AnyNode, AnyWire} from "core/models/types";


export const SplitWireTool: Tool = (() => {
    let node: AnyNode;

    let action: GroupAction;

    let tempAction: Action | undefined;

    return {
        shouldActivate(event: InputManagerEvent, { locked, circuit, input, curPressedObjID }: CircuitInfo): boolean {
            if (locked)
                return false;
            if (!curPressedObjID)
                return false;
            // Activate if the user dragged over a wire with 1 touch/finger
            return (event.type === "mousedrag" && event.button === LEFT_MOUSE_BUTTON &&
                    input.getTouchCount() === 1 &&
                    circuit.getObj(curPressedObjID)!.baseKind === "Wire");
        },
        shouldDeactivate(event: InputManagerEvent, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },

        onActivate(event: InputManagerEvent, info: CircuitInfo): void {
            const { circuit, selections, curPressedObjID } = info;

            const wire = circuit.getObj(curPressedObjID!) as AnyWire;

            // Make UUID for the node ourselves so we can keep track of it
            const nodeID = uuid();

            action = new GroupAction([
                DeselectAll(selections),
                Split(circuit, wire, info.viewManager.getTopDepth() + 1, nodeID),
                Select(selections, nodeID),
            ], "Split Wire");

            info.curPressedObjID = nodeID;

            node = circuit.getObj(nodeID)! as AnyNode;

            // explicitly start a drag
            this.onEvent(event, info);
        },
        onDeactivate({}: InputManagerEvent, { history }: CircuitInfo): void {
            if (!tempAction)
                throw new Error("No temp action for SplitWireTool?");
            history.add(action.add(tempAction));
            tempAction = undefined;
        },

        // Translate the noded
        onEvent(event: InputManagerEvent, info: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const { input, circuit } = info;

            tempAction?.undo();

            // Move node onto cursor and snap if holding shift
            let newPos = CalcWorldMousePos(info);
            if (input.isShiftKeyDown())
                newPos = SnapToGrid(newPos);

            tempAction = SetPos(circuit, node.id, newPos);

            return true;
        },
    }
})();
