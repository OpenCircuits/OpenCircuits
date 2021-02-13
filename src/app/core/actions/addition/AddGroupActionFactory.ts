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
        const inp = wire.getP1();
        const out = wire.getP2();
        inp.disconnect(wire);
        out.disconnect(wire);
        action.add(new ConnectionAction(inp, out));
    }

    return action;
}
