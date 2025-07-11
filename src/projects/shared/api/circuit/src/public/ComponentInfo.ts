import {PortConfig} from "shared/api/circuit/internal/impl/ObjInfo";


export interface ComponentInfo {
    readonly kind: string;
    readonly portGroups: readonly string[];
    readonly defaultPortConfig: Readonly<PortConfig>;
    readonly portConfigs: ReadonlyArray<Readonly<PortConfig>>;
}
