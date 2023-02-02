import {PortConfig} from "core/public/api/PortConfig";


export interface DigitalPortConfig extends PortConfig {
    readonly inputGroups: readonly string[];
    readonly outputGroups: readonly string[];

    readonly numInputPorts: number;
    readonly numOutputPorts: number;
}
