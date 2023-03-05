import {CircuitInternal} from "core/internal";
import {Port} from "core/public";
import {ComponentImpl} from "core/public/api/impl/Component";

import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";

import {DigitalCircuitState}      from "./DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";
import {DigitalPortImpl} from "./DigitalPort";

export class DigitalComponentImpl extends ComponentImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalComponent {

    public override get info(): DigitalComponentInfo {
        return new DigitalComponentInfoImpl(this.circuit, this.kind);
    }

    public override firstAvailable(portGroup: Port["group"]): DigitalPort | undefined {
        if (!this.info.portGroups.includes(portGroup))
            return undefined; // Invalid port group for the component
        
        const ports = this.internal.getPortsForComponent(this.id);

        // Find out if the portGroup is of type input or output
        const isInputType = this.info.inputPortGroups.includes(portGroup);
        const isOutputType = this.info.outputPortGroups.includes(portGroup);

        const firstAvailableHelper = (id: string) => {
            const portObject = this.internal.getPortByID(id)!;
            const portWire = this.internal.getWiresForPort(id); // no wires = available

            if (isInputType && portObject.unwrap().group === portGroup)
                return true;  
            if (isOutputType && portObject.unwrap().group === portGroup && portWire.unwrap().size === 0)
                return true;  
        
            return false;
        }

        const match = [...ports.unwrap()].find(firstAvailableHelper)!;
        if (!match)
            return undefined;
        return new DigitalPortImpl(this.circuit, match);
    }
}
