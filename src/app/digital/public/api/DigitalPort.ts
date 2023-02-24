import {Port} from "core/public";

import {DigitalComponent} from "./DigitalComponent";


export interface DigitalPort extends Port {
    readonly parent: DigitalComponent;

    readonly isInputPort: boolean;
    readonly isOutputPort: boolean;

    isAvailable(): boolean;
}
