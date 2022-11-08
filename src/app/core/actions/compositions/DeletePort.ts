import {AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {Action}      from "../Action";
import {GroupAction} from "../GroupAction";
import {Delete}      from "../units/Place";

import {DeleteGroup} from "./DeleteGroup";


export function DeletePort(circuit: CircuitController<AnyObj>, port: AnyPort): Action {
    return new GroupAction([
        // Delete all connections as well
        DeleteGroup(circuit, circuit.getWiresFor(port)),
        Delete(circuit, port),
    ], "Remove Port");
}
