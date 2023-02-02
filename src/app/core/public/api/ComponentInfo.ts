import {PortConfig} from "./PortConfig";


export interface ComponentInfo {
    readonly kind: string;
    readonly portGroups: readonly string[];
    readonly defaultPortConfig: PortConfig;
}
