import {GUID} from "shared/api/circuit/public";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {PortImpl} from "shared/api/circuit/public/impl/Port";


export class AnalogPortImpl extends PortImpl<CircuitTypes> {
    protected override getWireKind(_p1: GUID, _p2: GUID): string {
        return "AnalogWire";
    }
}
