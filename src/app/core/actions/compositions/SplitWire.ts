import {ColorToHex, blend, parseColor} from "svg2canvas";

import {CircuitDesigner} from "core/models";

import {Node} from "core/models/Node";
import {Wire} from "core/models/Wire";

import {GroupAction}         from "../GroupAction";
import {Connect, Disconnect} from "../units/Connect";
import {Delete, Place}       from "../units/Place";
import {SetProperty}         from "../units/SetProperty";


/**
 * Creates an action to represent a Wire being split.
 *
 * @param designer The CircuitDesigner the action is being done on.
 * @param w        The Wire being split.
 * @param port     The new Port that is splitting the Wire.
 * @returns          a GroupAction representing the Wire being split.
 */
export function SplitWire(designer: CircuitDesigner, w: Wire, port: Node): GroupAction {
    const action = new GroupAction([], "Split Wire Action");
    action.add(Disconnect(designer, w));
    action.add(Place(designer, port));

    // Creates and saves new ConnectionAction to a var and then executes the action.
    const con1 = Connect(designer, w.getP1(), port.getP1());
    action.add(con1);

    // After execution the color of the first half of the new wire is set to the color of the old wire.
    action.add(SetProperty(con1.getWire(), "color", w.getProp("color")));

    // Repeats same process for the other half of the split wire.
    const con2 = Connect(designer, port.getP2(), w.getP2());
    action.add(con2);
    action.add(SetProperty(con2.getWire(), "color", w.getProp("color")));

    return action;
}


/**
 * Creates an action to represent a Wire being snipped.
 *
 * @param designer The CircuitDesigner the action is being done on.
 * @param port     The Port being snipped from the Wire.
 * @throws         An Error if the port does not have exactly 2 wires connected.
 * @returns          A GroupAction representing the Wire being snipped.
 */
export function SnipWire(designer: CircuitDesigner, port: Node): GroupAction {
    const wires = [...port.getP1().getWires(), ...port.getP2().getWires()];
    if (wires.length !== 2)
        throw new Error("Cannot create snip action with WirePort of >2 wires!");

    const ports = wires.flatMap((w) => [w.getP1(), w.getP2()]).filter((p) => p.getParent() !== port);
    if (ports.length !== 2)
        throw new Error("Failed to find 2 ports to snip to");

    const action = new GroupAction([], "Snip Wire Action");

    action.add(Disconnect(designer, wires[1]));
    action.add(Disconnect(designer, wires[0]));
    action.add(Delete(designer, port));

    const con1 = Connect(designer, ports[0], ports[1]);
    action.add(con1);

    // Change color on new wire that's a blend between the two wires
    action.add(SetProperty(
        con1.getWire(), "color",
        ColorToHex(blend(
            parseColor(wires[0].getProp("color") as string),
            parseColor(wires[1].getProp("color") as string), 0.5
        )),
    ));

    return action;
}


/**
 * Creates a GroupAction of snip actions.
 *
 * @param designer The CircuitDesigner the actions are being done on.
 * @param ports    The Ports being snipped.
 * @returns          A GroupAction of the actions to snip the wires.
 */
export function SnipGroup(designer: CircuitDesigner, ports: Node[]): GroupAction {
    return new GroupAction(
        ports.map((p) => SnipWire(designer, p)),
        "Group Snip Action"
    );
}
