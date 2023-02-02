import {GUID}     from "core/internal";
import {PortImpl} from "core/public/api/impl/Port";

import {DigitalPort} from "../DigitalPort";

import {DigitalCircuitState} from "./DigitalCircuitState";


export class DigitalPortImpl extends PortImpl<DigitalCircuitState> implements DigitalPort {
    public readonly isInputPort: boolean;
    public readonly isOutputPort: boolean;

    public constructor(circuit: DigitalCircuitState, objID: GUID) {
        super(circuit, objID);

        this.isInputPort  =  (this.parent.info.inputPortGroups.includes(this.group));
        this.isOutputPort = (this.parent.info.outputPortGroups.includes(this.group));
    }
}
