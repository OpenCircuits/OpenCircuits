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

    public override get isNode(): boolean {
        return (this.kind === "DigitalNode");
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

        const ports = this.internal.doc.getPortsForComponent(this.id).unwrap();

        // Find out if the portGroup is of type input or output
        const isInputType = this.info.inputPortGroups.includes(portGroup);
        const isOutputType = this.info.outputPortGroups.includes(portGroup);

        const firstAvailableHelper = (id: string) => {
            const portObject = this.internal.doc.getPortByID(id).unwrap();
            const portWire = this.internal.doc.getWiresForPort(id).unwrap(); // no wires = available

            if (isInputType && portObject.group === portGroup)
                return true;
            return (isOutputType && portObject.group === portGroup && portWire.size === 0);
        }

        const match = [...ports].find(firstAvailableHelper)!;
        if (!match)
            return undefined;
        return new DigitalPortImpl(this.circuit, match);
    }
}
