import {Schema} from "core/schema";


export interface PortConfig extends Record<string, number> {}

export interface ObjInfo {
    readonly baseKind: Schema.Obj["baseKind"];
    readonly kind: string;
    checkPropValue(key: string, value?: Schema.Prop): boolean;
}

// Describes legal component configurations.
// NOTE: The configuration wherein each port group has zero ports is IMPLICITLY LEGAL, because the
//  component is UNREACHABLE in any propagator.
export interface ComponentInfo extends ObjInfo {
    readonly baseKind: "Component";
    readonly portGroups: string[];
    readonly defaultPortConfig: PortConfig;

    isValidPortConfig(p: PortConfig): boolean;
    makePortsForConfig(id: Schema.GUID, p: PortConfig): Schema.Port[] | undefined;

    // i.e. Prevents fan-in on digital ports, could prevent illegal self-connectivity
    isValidPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): boolean;

    // Also i.e. thumbnail, display name, description, etc.
}

// TODO: seems kind of heavy
export function IsValidPortList(info: ComponentInfo, ports: Schema.Port[]): boolean {
    const counts = {} as Record<string, number>;
    ports.forEach(({ group }) =>
        counts[group] = (counts[group] ?? 0) + 1);
    return info.isValidPortConfig(counts);
}

export interface ObjInfoProvider {
    get(kind: string): ObjInfo | undefined;
    getComponent(kind: string): ComponentInfo | undefined;
    // TODO: potentially:
    // getWire(kind: string): WireInfo | undefined;
    // getPort(kind: string): PortInfo | undefined;
}
