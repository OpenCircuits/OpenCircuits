import {GroupAction} from "../GroupAction";

import {CircuitDesigner} from "core/models";
import {Wire} from "core/models/Wire";
import {Node} from "core/models/Node";

import {ConnectionAction, DisconnectAction} from "./ConnectionAction";
import {PlaceAction, DeleteAction} from "./PlaceAction";


export function CreateSplitWireAction(designer: CircuitDesigner, w: Wire, port: Node): GroupAction {
    const action = new GroupAction();

    action.add(new DisconnectAction(designer, w));
    action.add(new PlaceAction(designer, port));
    action.add(new ConnectionAction(designer, w.getP1(), port.getP1()));
    action.add(new ConnectionAction(designer, port.getP2(), w.getP2()));

    return action;
}

export function CreateSnipWireAction(designer: CircuitDesigner, port: Node): GroupAction {
    const wires = port.getP1().getWires().concat(port.getP2().getWires());
    if (wires.length != 2)
        throw new Error("Cannot create snip action with WirePort of >2 wires!");

    const ports = wires.flatMap(w => [w.getP1(), w.getP2()]).filter(p => p.getParent() != port);
    if (ports.length != 2)
        throw new Error("Failed to find 2 ports to snip to");

    const action = new GroupAction();

    action.add(new DisconnectAction(designer, wires[0]));
    action.add(new DisconnectAction(designer, wires[1]));
    action.add(new DeleteAction(designer, port));
    action.add(new ConnectionAction(designer, ports[0], ports[1]));

    return action;
}

export function CreateGroupSnipAction(designer: CircuitDesigner, ports: Node[]): GroupAction {
    return new GroupAction(ports.map(p => CreateSnipWireAction(designer, p)));
}
