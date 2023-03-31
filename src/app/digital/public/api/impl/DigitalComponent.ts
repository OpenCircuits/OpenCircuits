import {ComponentImpl} from "core/public/api/impl/Component";

import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";

import {DigitalCircuitState}      from "./DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";


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
}
