import {Component} from "core/public";

import {DigitalPort} from "./DigitalPort";
import {DigitalComponentInfo} from "./DigitalComponentInfo";

export interface DigitalComponent extends Component {
    readonly info: DigitalComponentInfo;

    firstAvailable(portGroup: string): DigitalPort;

    // public function firstAvailable(portGroup: string): DigitalPort {
    //     let inputPorts;
    //     if (portGroup === "input") 
    //         inputPorts = DigitalComponentInfo.inputPortGroups;
    //     else if (portGroup === "output") 
    //         inputPorts = DigitalComponentInfo.inputPortGroups;
        
        
    //         return DigitalPortImpl;
    
    // }
}
