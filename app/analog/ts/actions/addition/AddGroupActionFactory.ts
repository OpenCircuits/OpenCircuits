import {GroupAction} from "../GroupAction";
import {PlaceAction} from "./PlaceAction";
import {ConnectionAction} from "./ConnectionAction";

import {SeparatedComponentCollection} from "analog/utils/ComponentUtils";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";

export function CreateAddGroupAction(designer: EECircuitDesigner, group: SeparatedComponentCollection): GroupAction {
    const action = new GroupAction();

    const objs = group.getAllComponents();
    const wires = group.wires;

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
