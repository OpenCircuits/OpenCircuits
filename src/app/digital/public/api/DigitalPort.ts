import {Port} from "core/public";

import {DigitalComponent} from "./DigitalComponent";


export interface DigitalPort extends Port {
    readonly parent: DigitalComponent;

    readonly isInputPort: boolean;
    readonly isOutputPort: boolean;

    /**
     * Returns true if a port is available, false otherwise.
     * 
     * @returns True or false.
     */
    isAvailable(): boolean;
}
