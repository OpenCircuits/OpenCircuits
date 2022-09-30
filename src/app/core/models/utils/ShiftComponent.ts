import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetProperty} from "core/actions/units/SetProperty";

import {AnyComponent} from "../types";


export function ShiftComponents({ circuit, viewManager }: CircuitInfo, cs: AnyComponent[]): Action {
    const newZ = viewManager.getTopDepth() + 1;
    return new GroupAction(
        cs.map((c) => {
            const ports = circuit.getPortsFor(c);
            return new GroupAction(
                [...ports, c].map((o) => SetProperty(circuit, o.id, "zIndex", newZ)),
            "Shift Component");
        }),
    "Shift Components");
}
