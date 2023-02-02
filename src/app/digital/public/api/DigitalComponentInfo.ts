import {ComponentInfo} from "core/public";

import {DigitalPortConfig} from "./DigitalPortConfig";


export interface DigitalComponentInfo extends ComponentInfo {
    readonly defaultPortConfig: DigitalPortConfig;

    isInputPortGroup(group: string): boolean;
    isOutputPortGroup(group: string): boolean;
}
