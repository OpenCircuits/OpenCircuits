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
    // TODO: Maybe move these to `PortConfigurationInfo`
    isPortAvailable(port: Schema.Port, curConnections: Schema.Port[]): boolean;
    checkPortConnectivity(port: Schema.Port, newConnection: Schema.Port, curConnections: Schema.Port[]): Result;

    getValidPortConfigs(): ReadonlyArray<Readonly<PortConfig>>;
    getDefaultPortName(port: Schema.Port): string | undefined;

    // Also i.e. thumbnail, display name, description, etc.
}

export interface WireConfigurationInfo extends ObjInfo {
    readonly baseKind: "Wire";

    getSplitConnections(p1: Schema.Port, p2: Schema.Port, wire: Schema.Wire): Result<{
        nodeKind: string;
        p1Group: string;
        p1Idx: number;
        p2Group: string;
        p2Idx: number;
    }>;
}

export interface PortConfigurationInfo extends ObjInfo {
    readonly baseKind: "Port";

    getWireKind(p1: Schema.Port, p2: Schema.Port): Result<string>;
}

export interface ObjInfoProvider {
    // TODO: Maybe use i.e. Option<ObjInfo>=
    getComponent(kind: string, icId?: GUID): ComponentConfigurationInfo | undefined;
    getWire(kind: string): WireConfigurationInfo | undefined;
    getPort(kind: string): PortConfigurationInfo | undefined;

    createIC(ic: Schema.IntegratedCircuit): void;
    deleteIC(ic: Schema.IntegratedCircuit): void;
    checkIfICValid(ic: Schema.IntegratedCircuit): Result;

    isIC(c: Schema.Component): boolean;
}

export abstract class BaseObjInfoProvider implements ObjInfoProvider {
    protected readonly ics: Map<string, ComponentConfigurationInfo>;
    protected readonly components: Map<string, ComponentConfigurationInfo>;
    protected readonly wires: Map<string, WireConfigurationInfo>;
    protected readonly ports: Map<string, PortConfigurationInfo>;

    protected readonly validPinKinds: string[];

    public constructor(
        components: ComponentConfigurationInfo[],
        wires: WireConfigurationInfo[],
        ports: PortConfigurationInfo[],
        validPinKinds: string[] = [],
    ) {
        this.components = new Map(components.map((info) => [info.kind, info]));
        this.wires      = new Map(wires     .map((info) => [info.kind, info]));
        this.ports      = new Map(ports     .map((info) => [info.kind, info]));
        this.ics        = new Map();

        this.validPinKinds = validPinKinds;
    }
    public getComponent(kind: string, icId?: GUID): ComponentConfigurationInfo | undefined {
        if (kind === "IC" && !icId)
            throw new Error("BaseObjInfoProver: Must provide icId when getting info for an IC!");
        if (icId)
            return this.ics.get(icId);
        return this.components.get(kind);
    }

    public getWire(kind: string): WireConfigurationInfo | undefined {
        return this.wires.get(kind);
    }

    public getPort(kind: string): PortConfigurationInfo | undefined {
        return this.ports.get(kind);
    }

    public abstract createIC(ic: Schema.IntegratedCircuit): void;

    public deleteIC(ic: Schema.IntegratedCircuit): void {
        this.ics.delete(ic.metadata.id);
    }

    public checkIfICValid(ic: Schema.IntegratedCircuit): Result {
        // Check that all pins correspond to allow objects internally
        for (const pin of ic.metadata.pins) {
            const port = ic.ports.find((p) => p.id === pin.id);
            if (!port)
                return ErrE(`Failed to find port with ${pin.id} corresponding to pin ${pin.name} [${pin.group}]!`);
            const parent = ic.comps.find((c) => (c.id === port.parent));
            if (!parent)
                return ErrE(`Failed to find parent component ${port.parent} corresponding to pin ${pin.name} [${pin.group}]!`);
            if (this.validPinKinds.length > 0 && !this.validPinKinds.includes(parent.kind))
                return ErrE(`Failed to find valid pin kind ${parent.kind} corresponding to pin ${pin.name} [${pin.group}]!`);
        }
        return OkVoid();
    }

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
export type DefaultPortNameGenerator = Record<string, string[] | ((index: number) => string)>;
export abstract class BaseComponentConfigurationInfo extends BaseObjInfo<"Component">
                                                     implements ComponentConfigurationInfo {
    public readonly defaultPortConfig: PortConfig;
    public readonly portGroups: string[];

    protected readonly validPortConfigs: PortConfig[];

    protected readonly defaultPortNames?: DefaultPortNameGenerator;

    public readonly isNode: boolean;

    public constructor(
        kind: string,
        props: PropTypeMap,
        portGroups: string[],
        portConfigs: PortConfig[],
        isNode: boolean,
        defaultPortNames?: DefaultPortNameGenerator,
        defaultConfig = 0
    ) {
        super("Component", kind, { ...props, "x": "number", "y": "number", "angle": "number" });

        this.defaultPortConfig = portConfigs[defaultConfig];
        this.portGroups = portGroups;

        this.validPortConfigs = portConfigs;
        this.defaultPortNames = defaultPortNames;

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
    public getDefaultPortName(port: Schema.Port): string | undefined {
        const generator = this.defaultPortNames?.[port.group];
        if (!generator)
            return;
        return (typeof generator === "function" ? generator(port.index) : generator[port.index]);
    }

    public abstract isPortAvailable(port: Schema.Port, curConnections: Schema.Port[]): boolean;
    public abstract checkPortConnectivity(
        port: Schema.Port,
        newConnection: Schema.Port,
        curConnections: Schema.Port[],
    ): Result;
}

export abstract class BaseWireConfigurationInfo extends BaseObjInfo<"Wire"> implements WireConfigurationInfo {
    public constructor(
        kind: string,
        props: PropTypeMap
    ) {
        super("Wire", kind, { ...props, "color": "string" });
    }

    public abstract getSplitConnections(p1: Schema.Port, p2: Schema.Port, wire: Schema.Wire): Result<{
        nodeKind: string;
        p1Group: string;
        p1Idx: number;
        p2Group: string;
        p2Idx: number;
    }>;
}

export class BasePortConfigurationInfo extends BaseObjInfo<"Port"> implements PortConfigurationInfo {
    protected readonly wireKind: string;

    public constructor(
        kind: string,
        props: PropTypeMap,
        wireKind: string,
    ) {
        super("Port", kind, props);

        this.wireKind = wireKind;
    }

    public getWireKind(_p1: Schema.Port, _p2: Schema.Port): Result<string> {
        // TODO: Expand this support wires based on the ports it's connecting
        return Ok(this.wireKind);
    }
}
