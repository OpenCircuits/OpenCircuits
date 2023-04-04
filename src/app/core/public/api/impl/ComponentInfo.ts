import {ComponentInfo as ComponentInfoInternal, PortConfig} from "core/internal/impl/ComponentInfo";

import {ComponentInfo} from "../ComponentInfo";

import {CircuitState} from "./CircuitState";


export class ComponentInfoImpl implements ComponentInfo {
    public readonly kind: string;
    public readonly portGroups: readonly string[];
    public readonly defaultPortConfig: Readonly<PortConfig>;

    protected readonly info: ComponentInfoInternal;
    protected state: CircuitState;

    public constructor(state: CircuitState, kind: string) {
        const info = state.circuit.getComponentInfo(kind);
        if (!info)
            throw new Error(`Failed to find component info for ${kind}!`);
        this.info = info;
        this.state = state;
        this.kind = kind;
        this.portGroups = info.portGroups;
        this.defaultPortConfig = info.defaultPortConfig;
    }
}
