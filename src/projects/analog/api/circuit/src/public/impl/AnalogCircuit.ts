import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {Port, ReadonlyICPin} from "shared/api/circuit/public";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {CircuitImpl} from "shared/api/circuit/public/impl/Circuit";


export class AnalogCircuitImpl extends CircuitImpl<CircuitTypes> {
    protected override checkIfPinIsValid(_pin: ReadonlyICPin, port: Port): Result {
        if (port.parent.kind !== "AnalogPin")
            return ErrE(`TestCircuit.checkIfPinIsValid: Pin must be apart of an 'AnalogPin' component! Found: '${port.parent.kind}' instead!`);
        return OkVoid();
    }
}
