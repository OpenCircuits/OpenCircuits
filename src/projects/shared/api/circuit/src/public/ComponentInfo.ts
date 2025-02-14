import {PortConfig} from "shared/api/circuit/internal/impl/ComponentInfo";


export interface ComponentInfo {
    readonly kind: string;
    readonly portGroups: readonly string[];
    readonly defaultPortConfig: Readonly<PortConfig>;
}
