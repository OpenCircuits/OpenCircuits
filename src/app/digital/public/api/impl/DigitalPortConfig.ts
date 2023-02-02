import {PortConfig as PortConfigInternal} from "core/internal/impl/ComponentInfo";
import {CircuitState}                     from "core/public/api/impl/CircuitState";
import {PortConfigImpl}                   from "core/public/api/impl/PortConfig";
import {DigitalComponentInfo}             from "digital/internal/DigitalComponents";

import {DigitalPortConfig} from "../DigitalPortConfig";


export class DigitalPortConfigImpl extends PortConfigImpl implements DigitalPortConfig {
    public readonly inputGroups: readonly string[];
    public readonly outputGroups: readonly string[];

    public readonly numInputPorts: number;
    public readonly numOutputPorts: number;

    protected readonly info: DigitalComponentInfo;

    public constructor(state: CircuitState, kind: string, config: PortConfigInternal) {
        super(state, kind, config);

        const info = state.circuit.getComponentInfo(kind);
        if (!info)
            throw new Error(`Failed to find component info for ${kind}!`);
        if (!(info instanceof DigitalComponentInfo))
            throw new Error(`Component info is not digital for ${kind}!`);
        this.info = info;

        this.inputGroups  = this.groups.filter((g) => (info.portGroupInfo[g] ===  "input"));
        this.outputGroups = this.groups.filter((g) => (info.portGroupInfo[g] === "output"));

        this.numInputPorts  = this.inputGroups .map((g) => this.counts[g]).reduce((a, b) => (a + b));
        this.numOutputPorts = this.outputGroups.map((g) => this.counts[g]).reduce((a, b) => (a + b));
    }
}
