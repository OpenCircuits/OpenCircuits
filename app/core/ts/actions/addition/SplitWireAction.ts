import {GroupAction} from "../GroupAction";

import {Wire} from "core/models/Wire";
import {Node} from "core/models/Node";

import {ConnectionAction, DisconnectAction} from "./ConnectionAction";
import {PlaceAction, DeleteAction} from "./PlaceAction";

export function CreateSplitWireAction(w: Wire, port: Node): GroupAction {
    const action = new GroupAction();

    action.add(new DisconnectAction(w));
    action.add(new PlaceAction(w.getDesigner(), port));
    action.add(new ConnectionAction(w.getP1(), port.getP1()));
    action.add(new ConnectionAction(port.getP2(), w.getP2()));

    return action;
}

export function CreateSnipWireAction(port: Node): GroupAction {
    const wires = port.getP1().getWires().concat(port.getP2().getWires());
    if (wires.length != 2)
        throw new Error("Cannot create snip action with WirePort of >2 wires!");

    const ports = wires.flatMap(w => [w.getP1(), w.getP2()]).filter(p => p.getParent() != port);
    if (ports.length != 2)
        throw new Error("Failed to find 2 ports to snip to");

    const action = new GroupAction();

    action.add(new DisconnectAction(wires[0]));
    action.add(new DisconnectAction(wires[1]));
    action.add(new DeleteAction(port));
    action.add(new ConnectionAction(ports[0], ports[1]));

    return action;
}

export function CreateGroupSnipAction(ports: Node[]): GroupAction {
    return new GroupAction(ports.map(p => CreateSnipWireAction(p)));
}
