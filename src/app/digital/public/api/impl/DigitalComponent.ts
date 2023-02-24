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
        let Ports;

        // Get all ports of the specified port group
        if (portGroup === "input") {
            Ports = this.info.inputPortGroups;
        } else {
            Ports = this.info.outputPortGroups;
            // output ports are always available
            return new DigitalPortImpl(this.circuit, Ports[0]);
        }
            
        // Case: no "input" ports are available
        if (Ports.length == 0) {
            return undefined;
        } 

        for (var portNum of Ports) {
            
        }
        return new DigitalPortImpl(this.circuit, Ports[0]);
    
    }
}
