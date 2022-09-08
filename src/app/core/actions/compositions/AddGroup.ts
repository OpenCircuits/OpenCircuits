import {IOObjectSet} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";

import {GroupAction} from "../GroupAction";
import {AddWire}     from "../units/AddWire";
import {Place}       from "../units/Place";


export function AddGroup(designer: CircuitDesigner, group: IOObjectSet) {
    const components = group.getComponents();
    const wires = group.getWires();

    return new GroupAction([
        ...components.map((c) => Place(designer, c)),
             ...wires.map((w) => AddWire(designer, w)),
    ]);
}
