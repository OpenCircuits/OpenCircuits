import {Port}          from "core/public";
import {ComponentImpl} from "core/public/api/impl/Component";

import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";

import {DigitalCircuitState}      from "./DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";
import {DigitalPortImpl}          from "./DigitalPort";


export class DigitalComponentImpl extends ComponentImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalComponent {

    public override get info(): DigitalComponentInfo {
        return new DigitalComponentInfoImpl(this.circuit, this.kind);
    }

    public get firstAvailableInput(): DigitalPort {
        // Find first available input port TODO[.](leon) - maybe think this through better
        return this.allPorts.find((port) => (port.isInputPort && port.connections.length === 0))!;
    }

    public get firstOutput(): DigitalPort {
        // Find first output port that is the first of its group
        return this.allPorts.find((port) => (port.isOutputPort && port.index === 0))!;
    }

    public override firstAvailable(portGroup: Port["group"]): DigitalPort | undefined {
        if (!this.info.portGroups.includes(portGroup))
            return undefined; // Invalid port group for the component

        const ports = [...this.internal.doc.getPortsForComponent(this.id).unwrap()]
            .map((id) => this.internal.doc.getPortByID(id).unwrap())
            .filter((port) => (port.group === portGroup));

        // Find out if the portGroup is of type input or output
        const isInputGroup = this.info.inputPortGroups.includes(portGroup);
        const isOutputGroup = this.info.outputPortGroups.includes(portGroup);

        if (!isInputGroup && !isOutputGroup)
            throw new Error(`Found port group ${portGroup} for ${this.kind} that is neither input nor output!`);

        const port = ports.find((port) => {
            // Output ports are always available
            if (isOutputGroup)
                return true;
            // Input ports are available if they have no connections
            const connections = this.internal.doc.getWiresForPort(port.id).unwrap();
            return (isInputGroup && connections.size === 0);
        });

        if (!port)
            return undefined;
        return new DigitalPortImpl(this.circuit, port.id);
    }
}
