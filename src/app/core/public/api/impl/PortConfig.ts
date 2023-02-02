import {PortConfig as PortConfigInternal} from "core/internal/impl/ComponentInfo";

import {PortConfig} from "../PortConfig";

import {CircuitState} from "./CircuitState";


export class PortConfigImpl implements PortConfig {
    public counts: Readonly<Record<string, number>>;
    public groups: readonly string[];

    public constructor(state: CircuitState, kind: string, config: PortConfigInternal) {
        const info = state.circuit.getComponentInfo(kind);
        if (!info)
            throw new Error(`Failed to find component info for ${kind}!`);
        this.counts = config;
        this.groups = Object.keys(config);
    }
}
