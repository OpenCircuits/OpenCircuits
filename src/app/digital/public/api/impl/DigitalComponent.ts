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
        const ports = this.internal.getPortsForComponent(this.id);

        const inputTypes = this.info.inputPortGroups;
        const outputTypes = this.info.outputPortGroups;

        const isInputType = inputTypes.includes(portGroup);
        const isOutputType = outputTypes.includes(portGroup)

        if (!isInputType && !isOutputType) 
            return undefined;

        function firstAvailableHelper(comp: DigitalComponentImpl, id: string): Boolean {
            let portObject = comp.internal.getPortByID(id);
            let portWire = comp.internal.getWiresForPort(id); // no wires = available
    
            if (comp.info.inputPortGroups && portObject !== undefined && portObject.group === portGroup)
                return true;  
            if (comp.info.outputPortGroups && portObject !== undefined && portObject.group === portGroup && portWire.size === 0) {
                return true;  
            }
            return false;
        }

        const match = Array.from(ports.values()).find(p => firstAvailableHelper(this, p));
        if (match !== undefined)
            return new DigitalPortImpl(this.circuit, match);  
        return undefined;
    }
}
