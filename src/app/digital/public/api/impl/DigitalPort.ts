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
        // output port is always available
        if (this.isOutputPort) 
            return true;
        
        // check if input port is connected ...

        return this.isInputPort;
    }
}
