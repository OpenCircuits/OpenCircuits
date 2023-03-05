import {Component} from "core/public";

import {DigitalPort} from "./DigitalPort";
import {DigitalComponentInfo} from "./DigitalComponentInfo";

export interface DigitalComponent extends Component {
    readonly info: DigitalComponentInfo;

    /**
     * Returns the first available port with the specified 
     * port group that a component contains.
     * 
     * @param portGroup defines the desired port group.
     * @returns A Port if there is one available, undefined otherwise. 
     */
    firstAvailable(portGroup: String): DigitalPort | undefined;
}
