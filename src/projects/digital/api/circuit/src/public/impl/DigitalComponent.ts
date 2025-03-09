import {GUID}          from "shared/api/circuit/public";
import {ComponentImpl} from "shared/api/circuit/public/impl/Component";

import {extend} from "shared/api/circuit/utils/Functions";

import {DigitalCircuit}                from "../DigitalCircuit";
import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalComponentInfo}          from "../DigitalComponentInfo";
import {DigitalPort}                   from "../DigitalPort";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {DigitalPortImpl}                   from "./DigitalPort";
import {DigitalComponentInfoImpl}          from "./DigitalComponentInfo";


export function DigitalComponentImpl(circuit: DigitalCircuit, state: DigitalCircuitState, id: GUID) {
    const { internal } = state;

    const base = ComponentImpl<DigitalTypes>(circuit, state, id);

    return extend(base, {
        get info(): DigitalComponentInfo {
            return DigitalComponentInfoImpl(state, base.kind);
        },

        isNode(): this is DigitalNode {
            return (base.kind === "DigitalNode");
        },

        get inputs(): DigitalPort[] {
            return base.ports["inputs"];
        },
        get outputs(): DigitalPort[] {
            return base.ports["outputs"];
        },
    } as const) satisfies DigitalComponent;
}
