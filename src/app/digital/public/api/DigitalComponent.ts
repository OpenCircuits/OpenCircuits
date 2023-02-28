import {Component} from "core/public";

import {DigitalPort} from "./DigitalPort";
import {DigitalComponentInfo} from "./DigitalComponentInfo";

export interface DigitalComponent extends Component {
    readonly info: DigitalComponentInfo;

    firstAvailable(portGroup: string): DigitalPort | undefined;
}
