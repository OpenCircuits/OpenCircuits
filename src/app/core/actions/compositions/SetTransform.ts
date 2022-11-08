import {Vector} from "Vector";

import {GUID} from "core/utils/GUID";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {GroupAction} from "../GroupAction";
import {SetProperty} from "../units/SetProperty";


export function SetPos(circuit: CircuitController<AnyObj>, id: GUID, pos: Vector) {
    return new GroupAction([
        SetProperty(circuit, id, "x", pos.x),
        SetProperty(circuit, id, "y", pos.y),
    ], "Set Position");
}

export function SetTransform(circuit: CircuitController<AnyObj>, id: GUID, pos: Vector, angle: number) {
    return new GroupAction([
        SetProperty(circuit, id, "x", pos.x),
        SetProperty(circuit, id, "y", pos.y),
        SetProperty(circuit, id, "angle", angle),
    ], "Set Transform");
}
