import { CircuitInternal } from "core/internal";
import {ComponentImpl} from "core/public/api/impl/Component";
import { exit } from "yargs";

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

        if (portGroup === "input") {
            const portTypes = this.info.inputPortGroups;
            if (!portTypes.includes('inputs')) {
                return undefined;
            } else {
                for(var p of Ports.values()) {
                    let portObject = this.internal.getPortByID(p);
                    let portWire = this.internal.getWiresForPort(p); // no wires = available
                    if (portObject !== undefined && portObject.group === 'inputs' && portWire.size === 0) {
                        return new DigitalPortImpl(this.circuit, p);  
                    }
                }
            }
        }

        if (portGroup === "output") {
            const portTypes = this.info.outputPortGroups;
            if (!portTypes.includes('outputs')) {
                return undefined;
            } else {
                for(var p of Ports.values()) {
                    let portObject = this.internal.getPortByID(p);
                    let portWire = this.internal.getWiresForPort(p); // no wires = available
                    if (portObject !== undefined && portObject.group === 'outputs') {
                        return new DigitalPortImpl(this.circuit, p);  
                    }
                }
            }
        }
    }
}
