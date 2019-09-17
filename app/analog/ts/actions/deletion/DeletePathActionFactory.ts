import {GroupAction} from "../GroupAction";
import {DeleteAction} from "../addition/PlaceAction";
import {DisconnectAction} from "../addition/ConnectionAction";

import {EEWire} from "analog/models/eeobjects/EEWire";
import {Node} from "analog/models/eeobjects/Node";

export function CreateDeletePathAction(path: Array<EEWire | Node>): GroupAction {
    const action = new GroupAction();

    // Remove wires first
    path.filter((p) => p instanceof EEWire)
            .map((p) => p as EEWire)
            .forEach((w) => action.add(new DisconnectAction(w)));

    // Then remove WirePorts
    path.filter((p) => p instanceof Node)
            .map((p) => p as Node)
            .forEach((wp) => action.add(new DeleteAction(wp)));

    return action;
}
