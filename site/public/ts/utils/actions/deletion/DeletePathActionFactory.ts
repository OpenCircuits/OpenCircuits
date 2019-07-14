import {GroupAction} from "../GroupAction";
import {DeleteAction} from "../addition/PlaceAction";
import {DisconnectAction} from "../addition/ConnectionAction";

import {Wire} from "../../../models/ioobjects/Wire";
import {WirePort} from "../../../models/ioobjects/other/WirePort";

export function CreateDeletePathAction(path: Array<Wire | WirePort>): GroupAction {
    const action = new GroupAction();

    // Remove wires first
    path.filter((p) => p instanceof Wire)
            .map((p) => p as Wire)
            .forEach((w) => action.add(new DisconnectAction(w)));

    // Then remove WirePorts
    path.filter((p) => p instanceof WirePort)
            .map((p) => p as WirePort)
            .forEach((wp) => action.add(new DeleteAction(wp)));

    return action;
}
