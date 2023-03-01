import {Result} from "core/utils/Result";

import {Schema} from "core/schema";


export type PortConfig = Record<string, number>

export interface ObjInfo {
    readonly baseKind: Schema.Obj["baseKind"];
    readonly kind: string;
    checkPropValue(key: string, value?: Schema.Prop): Result;
}

// Describes legal component configurations.
// NOTE: The configuration wherein each port group has zero ports is IMPLICITLY LEGAL, because the
//  component is UNREACHABLE in any propagator.
export interface ComponentInfo extends ObjInfo {
    readonly baseKind: "Component";
    readonly portGroups: string[];
    readonly defaultPortConfig: PortConfig;

    checkPortConfig(p: PortConfig): Result;
    makePortsForConfig(id: Schema.GUID, p: PortConfig): Result<Schema.Port[]>;

    // i.e. Prevents fan-in on digital ports, could prevent illegal self-connectivity
    checkPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): Result;

    // Also i.e. thumbnail, display name, description, etc.
}

// TODO: seems kind of heavy
export function CheckPortList(info: ComponentInfo, ports: Schema.Port[]): Result {
    return info.checkPortConfig(PortListToConfig(ports));
}

export function PortListToConfig(ports: Schema.Port[]): PortConfig {
    const counts = {} as Record<string, number>;
    ports.forEach(({ group }) =>
        counts[group] = (counts[group] ?? 0) + 1);
    return counts;
}

export interface ObjInfoProvider {
    // TODO: Maybe use i.e. Option<ObjInfo>
    get(kind: string): ObjInfo | undefined;
    getComponent(kind: string): ComponentInfo | undefined;
    // TODO: potentially:
    // getWire(kind: string): WireInfo | undefined;
    // getPort(kind: string): PortInfo | undefined;
}
