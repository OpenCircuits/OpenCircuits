import {GUID}          from "shared/api/circuit/public";
import {ComponentImpl} from "shared/api/circuit/impl/Component";

import {extend} from "shared/api/circuit/utils/Functions";

import {DigitalCircuit}       from "../DigitalCircuit";
import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";

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

        isNode(): boolean {
            return (base.kind === "DigitalNode");
        },

        get firstAvailableInput(): DigitalPort {
            // Find first available input port TODO[.](leon) - maybe think this through better
            return base.allPorts.find((port) => (port.isInputPort && port.connections.length === 0))!;
        },
        get firstOutput(): DigitalPort {
            // Find first output port that is the first of its group
            return base.allPorts.find((port) => (port.isOutputPort && port.index === 0))!;
        },

        firstAvailable(portGroup: DigitalPort["group"]): DigitalPort | undefined {
            if (!this.info.portGroups.includes(portGroup))
                return undefined; // Invalid port group for the component

            const ports = [...internal.doc.getPortsForComponent(id).unwrap()]
                .map((id) => internal.doc.getPortByID(id).unwrap())
                .filter((port) => (port.group === portGroup));

            // Find out if the portGroup is of type input or output
            const isInputGroup = this.info.inputPortGroups.includes(portGroup);
            const isOutputGroup = this.info.outputPortGroups.includes(portGroup);

            if (!isInputGroup && !isOutputGroup)
                throw new Error(`Found port group ${portGroup} for ${base.kind} that is neither input nor output!`);

            const port = ports.find((port) => {
                // Output ports are always available
                if (isOutputGroup)
                    return true;
                // Input ports are available if they have no connections
                const connections = internal.doc.getWiresForPort(port.id).unwrap();
                return (isInputGroup && connections.size === 0);
            });

            if (!port)
                return undefined;
            return DigitalPortImpl(circuit, state, port.id);
        },
    } as const) satisfies DigitalComponent;
}
