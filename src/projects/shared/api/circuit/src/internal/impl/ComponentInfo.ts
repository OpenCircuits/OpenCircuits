import {ErrE, Ok, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";
import {uuid} from "../../public";


export type PortConfig = Record<string, number>;

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

export class BaseObjInfoProvider implements ObjInfoProvider {
    private readonly components: Map<string, ComponentInfo>;
    private readonly wires: Map<string, ObjInfo>;
    private readonly ports: Map<string, ObjInfo>;

    public constructor(
        components: ComponentInfo[],
        wires: ObjInfo[],
        ports: ObjInfo[],
    ) {
        this.components = new Map(components.map((info) => [info.kind, info]));
        this.wires      = new Map(wires     .map((info) => [info.kind, info]));
        this.ports      = new Map(ports     .map((info) => [info.kind, info]));
    }

    public getComponent(kind: string): ComponentInfo | undefined {
        return this.components.get(kind);
    }

    public get(kind: string): ObjInfo | undefined {
        if (this.components.has(kind))
            return this.components.get(kind);
        if (this.wires.has(kind))
            return this.wires.get(kind);
        if (this.ports.has(kind))
            return this.ports.get(kind);
        return undefined;
    }
}

export type PropTypeMap = Record<string, Schema.Prop>;
export class BaseObjInfo<K extends Schema.Obj["baseKind"]> implements ObjInfo {
    public readonly baseKind: K;
    public readonly kind: string;

    protected readonly props: PropTypeMap;

    public constructor(
        baseKind: K,
        kind: string,
        props: PropTypeMap,
    ) {
        this.baseKind = baseKind;
        this.kind = kind;
        this.props = { ...props, "name": "string", "zIndex": "number", "isSelected": "boolean" };
    }

    public checkPropValue(key: string, value?: Schema.Prop): Result {
        if (!(key in this.props))
            return ErrE(`BaseObjInfo: ${key} not a valid prop`);
        if (value && (this.props[key] !== typeof value))
            return ErrE(`BaseObjInfo: ${key} expected type ${this.props[key]}, got ${typeof value}`);
        return OkVoid();
    }
}
export abstract class BaseComponentInfo extends BaseObjInfo<"Component"> implements ComponentInfo {
    public readonly defaultPortConfig: PortConfig;
    public readonly portGroups: string[];

    protected readonly validPortConfigs: PortConfig[];

    public constructor(
        kind: string,
        props: PropTypeMap,
        portGroups: string[],
        portConfigs: PortConfig[],
        defaultConfig = 0
    ) {
        super("Component", kind, { ...props, "x": "number", "y": "number", "angle": "number" });

        this.defaultPortConfig = portConfigs[defaultConfig];
        this.portGroups = portGroups;

        this.validPortConfigs = portConfigs;
    }

    protected abstract getPortInfo(p: PortConfig, group: string, index: number): Pick<Schema.Port, "kind" | "props">;

    public makePortsForConfig(componentID: string, p: PortConfig): Result<Schema.Port[]> {
        return Ok(Object.entries(p)
            .flatMap(([group, count]) =>
                new Array(count)
                    .fill(0)
                    .map((_, index) => ({
                        baseKind: "Port",
                        id:       uuid(),
                        parent:   componentID,
                        group,
                        index,
                        ...this.getPortInfo(p, group, index),
                    }))));
    }

    public checkPortConfig(p: PortConfig): Result {
        // Doesn't have all the port groups
        if (this.portGroups.some((group) => !(group in p))) {
            return ErrE("BaseComponentInfo: Port config {"
                + Object.entries(p).map(([k, v]) => `${k}: ${v}`).join(", ")
                + `} did not contain all groups ${this.portGroups}`);
        }

        // Return is some valid config matches the given config
        const hasValidConfig = this.validPortConfigs.some((counts) =>
            // Check each port group in the valid config and the given config to see
            //  if the counts all match
            this.portGroups.every((group) => (counts[group] === p[group])));

        return hasValidConfig ? OkVoid() : ErrE(`BaseComponentInfo: Failed to find matching config for ${p}`);
    }

    public abstract checkPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): Result;
}
