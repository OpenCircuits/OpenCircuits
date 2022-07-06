import {GroupAction} from "core/actions/GroupAction";

import {DisconnectAction} from "core/actions/addition/ConnectionAction";
import {DeleteAction}     from "core/actions/addition/PlaceAction";

import {CircuitDesigner} from "core/models";

import {Component} from "core/models/Component";
import {Node}      from "core/models/Node";
import {Wire}      from "core/models/Wire";


export function CreateDeletePathAction(designer: CircuitDesigner, path: Array<Wire | (Component & Node)>): GroupAction {
    const action = new GroupAction([], "Delete Path Action");

    // Remove wires first
    path.filter((p) => p instanceof Wire)
            .map((p) => p as Wire)
            .forEach((w) => action.add(new DisconnectAction(designer, w)));

    // Then remove WirePorts
    path.filter((p) => p instanceof Component)
            .map((p) => p as Component)
            .forEach((wp) => action.add(new DeleteAction(designer, wp)));

    return action;
}
