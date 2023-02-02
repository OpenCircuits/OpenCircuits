import {Component} from "core/public";

import {DigitalComponentInfo} from "./DigitalComponentInfo";


export interface DigitalComponent extends Component {
    readonly info: DigitalComponentInfo;
}
