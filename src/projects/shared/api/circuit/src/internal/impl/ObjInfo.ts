import {ErrE, Ok, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {GUID, Schema} from "shared/api/circuit/schema";
import {uuid} from "../../public";


export type PortConfig = Record<string, number>;

export interface ObjInfo {
    readonly baseKind: Schema.Obj["baseKind"];
    readonly kind: string;
    checkPropValue(key: string, value?: Schema.Prop): Result;
}

export function PortListToConfig(ports: Schema.Port[]): PortConfig {
    const counts: Record<string, number> = {};
    ports.forEach(({ group }) =>
        counts[group] = (counts[group] ?? 0) + 1);
    return counts;
}

// Describes legal component configurations.
// NOTE: The configuration wherein each port group has zero ports is IMPLICITLY LEGAL, because the
//  component is UNREACHABLE in any propagator.
export interface ComponentConfigurationInfo extends ObjInfo {
    readonly baseKind: "Component";
    readonly portGroups: string[];
    readonly defaultPortConfig: PortConfig;

    // Returns true if the 'kind' of this component is a 'Node'
    // Node components are a special denomination that usually exist in-between wires via a 'split' operation.
    // They have a few methods associated with them ('snipping', the inverse of a 'split').
    readonly isNode: boolean;

    checkPortConfig(p: PortConfig): Result;
    makePortsForConfig(id: Schema.GUID, p: PortConfig): Result<Schema.Port[]>;

    // i.e. Prevents fan-in on digital ports, could prevent illegal self-connectivity
    // checkPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): Result;
    isPortAvailable(port: Schema.Port, curConnections: Schema.Port[]): boolean;
    checkPortConnectivity(port: Schema.Port, newConnection: Schema.Port, curConnections: Schema.Port[]): Result;

    getValidPortConfigs(): ReadonlyArray<Readonly<PortConfig>>;

    // Also i.e. thumbnail, display name, description, etc.
}

export interface ObjInfoProvider {
    // TODO: Maybe use i.e. Option<ObjInfo>=
    getComponent(kind: string, icId?: GUID): ComponentConfigurationInfo | undefined;
    getWire(kind: string): ObjInfo | undefined;
    getPort(kind: string): ObjInfo | undefined;

    createIC(ic: Schema.IntegratedCircuit): void;
    deleteIC(ic: Schema.IntegratedCircuit): void;

    isIC(c: Schema.Component): boolean;
    // TODO: potentially:
    // getWire(kind: string): WireInfo | undefined;
    // getPort(kind: string): PortInfo | undefined;
}

export abstract class BaseObjInfoProvider implements ObjInfoProvider {
    protected readonly ics: Map<string, ComponentConfigurationInfo>;
    protected readonly components: Map<string, ComponentConfigurationInfo>;
    protected readonly wires: Map<string, ObjInfo>;
    protected readonly ports: Map<string, ObjInfo>;

    public constructor(
        components: ComponentConfigurationInfo[],
        wires: ObjInfo[],
        ports: ObjInfo[],
    ) {
        this.components = new Map(components.map((info) => [info.kind, info]));
        this.wires      = new Map(wires     .map((info) => [info.kind, info]));
        this.ports      = new Map(ports     .map((info) => [info.kind, info]));
        this.ics        = new Map();
    }

    public getComponent(kind: string, icId?: GUID): ComponentConfigurationInfo | undefined {
        if (kind === "IC" && !icId)
            throw new Error("BaseObjInfoProver: Must provide icId when getting info for an IC!");
        if (icId)
            return this.ics.get(icId);
        return this.components.get(kind);
    }

    public getWire(kind: string): ObjInfo | undefined {
        return this.wires.get(kind);
    }

    public getPort(kind: string): ObjInfo | undefined {
        return this.ports.get(kind);
    }

    public abstract createIC(ic: Schema.IntegratedCircuit): void;
    public abstract deleteIC(ic: Schema.IntegratedCircuit): void;

    public isIC(c: Schema.Component): boolean {
        return c.kind === "IC";
    }
}

export type PropTypeMap = Record<string, "string" | "number" | "boolean">;
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
            return ErrE(`BaseObjInfo: ${key} not a valid prop, valid props: [${Object.keys(this.props).join(",")}]`);
        if (value && (this.props[key] !== typeof value))
            return ErrE(`BaseObjInfo: ${key} expected type ${this.props[key]}, got ${typeof value}`);
        return OkVoid();
    }
}
export abstract class BaseComponentConfigurationInfo extends BaseObjInfo<"Component">
                                                     implements ComponentConfigurationInfo {
    public readonly defaultPortConfig: PortConfig;
    public readonly portGroups: string[];

    protected readonly validPortConfigs: PortConfig[];

    public readonly isNode: boolean;

    public constructor(
        kind: string,
        props: PropTypeMap,
        portGroups: string[],
        portConfigs: PortConfig[],
        isNode: boolean,
        defaultConfig = 0
    ) {
        super("Component", kind, { ...props, "x": "number", "y": "number", "angle": "number" });

        this.defaultPortConfig = portConfigs[defaultConfig];
        this.portGroups = portGroups;

        this.validPortConfigs = portConfigs;

        this.isNode = isNode;
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
        const invalidGroups = Object.keys(p).filter((group) => !this.portGroups.includes(group));
        if (invalidGroups.length > 0) {
            return ErrE("BaseComponentInfo: Port config {"
                + Object.entries(p).map(([k, v]) => `${k}: ${v}`).join(", ")
                + `} has invalid groups: [${invalidGroups.join(", ")}]`);
        }

        // Doesn't have all the port groups
        if (this.portGroups.some((group) => !(group in p))) {
            return ErrE("BaseComponentInfo: Port config {"
                + Object.entries(p).map(([k, v]) => `${k}: ${v}`).join(", ")
                + `} did not contain all groups [${this.portGroups.join(", ")}]`);
        }

        // Return if some valid config matches the given config
        const hasValidConfig = this.validPortConfigs.some((counts) =>
            // Check each port group in the valid config and the given config to see
            //  if the counts all match
            this.portGroups.every((group) => (counts[group] === p[group])));

        return hasValidConfig ? OkVoid() : ErrE(`BaseComponentInfo: Failed to find matching config for ${p}`);
    }

    public getValidPortConfigs(): ReadonlyArray<Readonly<PortConfig>> {
        return this.validPortConfigs;
    }

    public abstract isPortAvailable(port: Schema.Port, curConnections: Schema.Port[]): boolean;
    public abstract checkPortConnectivity(
        port: Schema.Port,
        newConnection: Schema.Port,
        curConnections: Schema.Port[],
    ): Result;
}
