import {IOObjectSet} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";

import {GroupAction} from "../GroupAction";

import {AddWireAction} from "./AddWireAction";
import {PlaceAction}   from "./PlaceAction";


export function CreateAddGroupAction(designer: CircuitDesigner, group: IOObjectSet) {
    const components = group.getComponents();
    const wires = group.getWires();

    return new GroupAction([
        ...components.map((c) => new PlaceAction(designer, c)),
             ...wires.map((w) => new AddWireAction(designer, w)),
    ]);
}
