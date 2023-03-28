import {Port}   from "core/public";
import {Signal} from "../utils/Signal";

import {DigitalComponent} from "./DigitalComponent";


export interface DigitalPort extends Port {
    readonly parent: DigitalComponent;

    readonly isInputPort: boolean;
    readonly isOutputPort: boolean;

    readonly signal: Signal;
}
