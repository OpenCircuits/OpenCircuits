import {GroupAction} from "../GroupAction";
import {PlaceAction} from "./PlaceAction";

import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {Component} from "../../../models/ioobjects/Component";

export function CreateGroupPlaceAction(designer: CircuitDesigner, objs: Array<Component>): GroupAction {
    const action = new GroupAction();

    for (const obj of objs)
        action.add(new PlaceAction(designer, obj));

    return action;
}
