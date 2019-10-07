import {GroupAction} from "core/actions/GroupAction";
import {DeleteAction} from "core/actions/addition/PlaceAction";
import {DisconnectAction} from "core/actions/addition/ConnectionAction";

import {Wire} from "core/models/Wire";
import {Component} from "core/models/Component";
import {Node} from "core/models/Node";

export function CreateDeletePathAction(path: Array<Wire | (Component & Node)>): GroupAction {
    const action = new GroupAction();

    // Remove wires first
    path.filter((p) => p instanceof Wire)
            .map((p) => p as Wire)
            .forEach((w) => action.add(new DisconnectAction(w)));

    // Then remove WirePorts
    path.filter((p) => p instanceof Component)
            .map((p) => p as Component)
            .forEach((wp) => action.add(new DeleteAction(wp)));

    return action;
}
