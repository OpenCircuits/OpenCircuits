import {GUID} from "shared/api/circuit/internal";

import {PortImpl} from "shared/api/circuit/public/impl/Port";

import {extend} from "shared/api/circuit/utils/Functions";

import {Signal} from "digital/api/circuit/utils/Signal";

import {DigitalCircuit} from "../DigitalCircuit";
import {DigitalPort}    from "../DigitalPort";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export function DigitalPortImpl(circuit: DigitalCircuit, state: DigitalCircuitState, id: GUID) {
    const base = PortImpl<DigitalTypes>(circuit, state, id, (_p1, _p2) => "DigitalWire");

    return extend(base, {
        get isInputPort(): boolean {
            return base.parent.info.inputPortGroups.includes(base.group);
        },
        get isOutputPort(): boolean {
            return base.parent.info.outputPortGroups.includes(base.group);
        },

        get signal(): Signal {
            return state.sim.getSignal(base.id);
        },
    } as const) satisfies DigitalPort;
}
