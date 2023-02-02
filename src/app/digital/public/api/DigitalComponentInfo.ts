import {ComponentInfo} from "core/public";


export interface DigitalComponentInfo extends ComponentInfo {
    readonly inputPortGroups: readonly string[];
    readonly outputPortGroups: readonly string[];
}
