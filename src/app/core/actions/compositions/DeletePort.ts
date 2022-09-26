import {AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {Action}      from "../Action";
import {GroupAction} from "../GroupAction";
import {Delete}      from "../units/Place";


export function DeletePort(circuit: CircuitController<AnyObj>, port: AnyPort): Action {
    return new GroupAction([
        // Delete all connections as well
        ...circuit.getWiresFor(port).map((w) => Delete(circuit, w)),
        Delete(circuit, port),
    ], "Remove Port");
}
