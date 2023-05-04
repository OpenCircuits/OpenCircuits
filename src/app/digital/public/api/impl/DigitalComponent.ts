import {GUID}          from "core/public";
import {ComponentImpl} from "core/public/api/impl/Component";

import {extend} from "core/utils/Functions";

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

            const ports = internal.doc.getPortsForComponent(base.id).unwrap();

            // Find out if the portGroup is of type input or output
            const isInputType = this.info.inputPortGroups.includes(portGroup);
            const isOutputType = this.info.outputPortGroups.includes(portGroup);

            const firstAvailableHelper = (id: string) => {
                const portObject = internal.doc.getPortByID(id).unwrap();
                const portWire = internal.doc.getWiresForPort(id).unwrap(); // no wires = available

                if (isInputType && portObject.group === portGroup)
                    return true;
                return (isOutputType && portObject.group === portGroup && portWire.size === 0);
            }

            const match = [...ports].find(firstAvailableHelper)!;
            if (!match)
                return undefined;
            return DigitalPortImpl(circuit, state, match);
        },
    } as const) satisfies DigitalComponent;
}
