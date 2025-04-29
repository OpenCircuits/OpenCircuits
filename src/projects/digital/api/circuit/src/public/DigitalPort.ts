import type {Port, ReadonlyPort} from "shared/api/circuit/public";

import type {APIToDigital} from "./DigitalCircuit";

import {Signal} from "digital/api/circuit/schema/Signal";


export interface ReadonlyDigitalPort extends APIToDigital<ReadonlyPort> {
    readonly isInputPort: boolean;
    readonly isOutputPort: boolean;

    readonly signal: Signal;

    /**
     * Returns true if a port is available, false otherwise.
     * Availabilty of ports:
     *    - If it's an output port, it's always available.
     *    - If it's an input port, to be considered available,
     *      it must NOT be connected via a wire to another port.
     *
     * @returns True or false.
     */
    readonly isAvailable: boolean;
}
type P = APIToDigital<Port> & ReadonlyDigitalPort;
export interface DigitalPort extends P {
    readonly isInputPort: boolean;
    readonly isOutputPort: boolean;

    readonly signal: Signal;

    /**
     * Returns true if a port is available, false otherwise.
     * Availabilty of ports:
     *    - If it's an output port, it's always available.
     *    - If it's an input port, to be considered available,
     *      it must NOT be connected via a wire to another port.
     *
     * @returns True or false.
     */
    readonly isAvailable: boolean;
}
