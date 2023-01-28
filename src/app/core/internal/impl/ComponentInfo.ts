import {Schema} from "core/schema";


export interface PortConfig {
    counts: Record<string, number>;
}

// Describes legal component configurations.
// NOTE: The configuration wherein each port group has zero ports is IMPLICITLY LEGAL, because the
//  component is UNREACHABLE in any propagator.
export interface ComponentInfo {
    readonly kind: string;
    readonly portGroups: string[];
    readonly defaultPortConfig: PortConfig;

    isValidPortConfig(p: PortConfig): boolean;
    makePortsForConfig(id: Schema.GUID, p: PortConfig): Schema.Port[] | undefined;

    // i.e. Prevents fan-in on digital ports, could prevent illegal self-connectivity
    isValidPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): boolean;

    // Also i.e. thumbnail, display name, description, etc.
}

export interface ComponentInfoProvider {
    get(kind: string): ComponentInfo | undefined;
}

// TODO: seems kind of heavy
export function IsValidPortList(info: ComponentInfo, ports: Schema.Port[]): boolean {
    const counts = {} as Record<string, number>;
    ports.forEach(({ group }) =>
        counts[group] = (counts[group] ?? 0) + 1);
    return info.isValidPortConfig({ counts });
}

//
// Example "Digital" implementation
//

class BasicGateInfo implements ComponentInfo {
    private readonly kindInternal: string;

    // i.e. with thumbnail, display name, description, etc.
    public constructor(kind: string) {
        this.kindInternal = kind;
    }

    public get kind(): string {
        return this.kindInternal;
    }
    public get portGroups(): string[] {
        return Object.keys(this.defaultPortConfig.counts);
    }
    public get defaultPortConfig(): PortConfig {
        return { counts: { "IN": 2, "OUT": 1 } };
    }

    public isValidPortConfig(p: PortConfig): boolean {
        // At least 2 inputs, exactly 1 output
        return p.counts["IN"] >= 2 && p.counts["OUT"] === 1;
    }

    public makePortsForConfig(componentID: Schema.GUID, p: PortConfig): Schema.Port[] {
        const ports: Schema.Port[] = [];
        for (const group of Object.keys(p.counts)) {
            for (let index = 0; index  < p.counts[group ]; ++index) {
                ports.push({
                    baseKind: "Port",
                    kind:     "DigitalPort",
                    id:       "", // TODO: generate

                    parent: componentID,
                    group,
                    index,
                    props:  {}, // TODO: any manditory props for Digial ports
                });
            }
        }
        return ports;
    }

    public isValidPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): boolean {
        for (const [me, o] of wires.entries()) {
            // Prevent fan-in on input ports
            if (me.group === "IN" && o.length > 1)
                return false;
        }
        return true;
    }
}
const ANDGateInfo: ComponentInfo = new BasicGateInfo("ANDGate");
const ORGateInfo: ComponentInfo = new BasicGateInfo("ORGate");
// etc...

class ExampleDigitalComponentInfoProvider implements ComponentInfoProvider {
    private readonly map: Map<string, ComponentInfo>;
    public constructor() {
        this.map = new Map([
            ["ANDGate", ANDGateInfo],
            ["ORGate", ORGateInfo],
            // etc...
        ]);
    }

    public get(kind: string): ComponentInfo | undefined {
        return this.map.get(kind)
    }
}

export function NewExampleComponentInfoProvider(): ComponentInfoProvider {
    return new ExampleDigitalComponentInfoProvider();
}
