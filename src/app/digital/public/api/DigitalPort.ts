import type {Port} from "core/public";

import type {APIToDigital} from "./DigitalCircuit";

import {Signal} from "../utils/Signal";


export interface DigitalPort extends APIToDigital<Port> {
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
    isAvailable(): boolean;
}
