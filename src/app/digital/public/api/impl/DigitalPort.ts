import {GUID}     from "core/internal";
import {PortImpl} from "core/public/api/impl/Port";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";
import {DigitalWire}      from "../DigitalWire";

import {DigitalCircuitState} from "./DigitalCircuitState";


export class DigitalPortImpl extends PortImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalPort {
    public readonly isInputPort: boolean;
    public readonly isOutputPort: boolean;

    public constructor(circuit: DigitalCircuitState, objID: GUID) {
        super(circuit, objID);

        this.isInputPort  =  (this.parent.info.inputPortGroups.includes(this.group));
        this.isOutputPort = (this.parent.info.outputPortGroups.includes(this.group));
    }

    // returns true if a port is available, false otherwise
    public isAvailable(): boolean {
        // Output ports are always available for more connections
        if (this.isOutputPort)
            return true;

        // Input ports are only available if there isn't a connection already
        const wires = this.internal.getWiresForPort(this.id);
        return (wires.unwrap().size === 0);
    }
}
