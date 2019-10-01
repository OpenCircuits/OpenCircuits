import {GroupAction} from "../GroupAction";
import {PlaceAction} from "./PlaceAction";
import {ConnectionAction} from "./ConnectionAction";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";

export function CreateAddGroupAction(designer: CircuitDesigner, group: IOObjectSet): GroupAction {
    const action = new GroupAction();

    const objs = group.getComponents();
    const wires = group.getWires();

    for (const obj of objs)
        action.add(new PlaceAction(designer, obj));

    for (const wire of wires) {
        const inp = wire.getInput();
        const out = wire.getOutput();
        inp.disconnect(wire);
        out.disconnect();
        action.add(new ConnectionAction(inp, out));
    }

    return action;
}
