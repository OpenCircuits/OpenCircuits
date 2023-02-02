import {ComponentInfo as ComponentInfoInternal} from "core/internal/impl/ComponentInfo";

import {ComponentInfo} from "../ComponentInfo";
import {PortConfig}    from "../PortConfig";

import {CircuitState}   from "./CircuitState";
import {PortConfigImpl} from "./PortConfig";


export class ComponentInfoImpl implements ComponentInfo {
    public readonly kind: string;
    public readonly portGroups: readonly string[];

    protected readonly info: ComponentInfoInternal;
    protected state: CircuitState;

    public constructor(state: CircuitState, kind: string) {
        const info = state.circuit.getComponentInfo(kind);
        if (!info)
            throw new Error(`Failed to find component info for ${kind}!`);
        this.info = info;
        this.kind = kind;
        this.portGroups = info.portGroups;
    }

    public get defaultPortConfig(): PortConfig {
        return new PortConfigImpl(this.state, this.kind, this.info.defaultPortConfig);
    }
}
