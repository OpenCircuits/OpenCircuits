import {GUID} from "shared/api/circuit/internal";

import {Port}     from "shared/api/circuit/public";
import {PortImpl} from "shared/api/circuit/public/impl/Port";

import {extend} from "shared/api/circuit/utils/Functions";

import {Signal} from "digital/api/circuit/utils/Signal";

import {DigitalCircuit} from "../DigitalCircuit";
import {DigitalPort}    from "../DigitalPort";
import {DigitalWire}    from "../DigitalWire";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export function DigitalPortImpl(circuit: DigitalCircuit, state: DigitalCircuitState, id: GUID) {
    const { internal, constructWire } = state;

    const base = PortImpl<DigitalTypes>(circuit, state, id);

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

        connectTo(other: DigitalPort): DigitalWire | undefined {
            internal.beginTransaction();

            const id = internal.connectWire("DigitalWire", base.id, other.id, {}).unwrap();

            internal.commitTransaction();

            return constructWire(id);
        },

        getLegalWires(): Port.LegalWiresQuery {
            return {
                isWireable: this.isAvailable(),

                contains: (port: DigitalPort) => (
                    this.isAvailable() &&
                    // Legal connections are only input -> output or output -> input ports
                    ((this.isInputPort && port.isOutputPort) ||
                     (this.isOutputPort && port.isInputPort))
                ),
            }
        },

        isAvailable(): boolean {
            // Output ports are always available for more connections
            if (this.isOutputPort)
                return true;

            // Input ports are only available if there isn't a connection already
            const wires = internal.doc.getWiresForPort(base.id).unwrap();
            return (wires.size === 0);
        },
    } as const) satisfies DigitalPort;
}
