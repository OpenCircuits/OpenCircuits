import { CircuitInternal } from "core/internal";
import {ComponentImpl} from "core/public/api/impl/Component";

import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";

import {DigitalCircuitState}      from "./DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";
import { DigitalPortImpl } from "./DigitalPort";


export class DigitalComponentImpl extends ComponentImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalComponent {

    public override get info(): DigitalComponentInfo {
        return new DigitalComponentInfoImpl(this.circuit, this.kind);
    }

    public override firstAvailable(portGroup: string): DigitalPort | undefined {
        const Ports = this.internal.getPortsForComponent(this.id);

        // Get all ports of the specified port group
        if (portGroup === "input") {
            const portTypes = this.info.inputPortGroups;
            if (!portTypes.includes('input')) {
                return undefined;
            } else {
                for (var p in Ports) {
                    const portObject = this.internal.getPortByID(p);
                    const portWire = this.internal.getWiresForPort(p); // no wires = available
                    if (portObject !== undefined && portObject.group === 'input' && portWire === undefined) 
                        return new DigitalPortImpl(this.circuit, p);   
                }
            }
        }

        if (portGroup === "output") {
            const portTypes = this.info.outputPortGroups;
            if (!portTypes.includes('output')) {
                return undefined;
            } else {
                for (var p in Ports) {
                    const portObject = this.internal.getPortByID(p);
                    // output ports are always available
                    if (portObject !== undefined && portObject.group === 'input') 
                        return new DigitalPortImpl(this.circuit, p);   
                }
            }
            
        }
        
        return undefined;
    }
}
