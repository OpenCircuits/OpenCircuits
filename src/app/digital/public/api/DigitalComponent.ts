import {Component} from "core/public";

import {DigitalComponentInfo} from "./DigitalComponentInfo";
import {DigitalPort}          from "./DigitalPort";


export interface DigitalComponent extends Component {
    readonly info: DigitalComponentInfo;

    readonly firstAvailableInput: DigitalPort;
    readonly firstOutput: DigitalPort;
}
