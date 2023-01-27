import { Schema } from "core/schema";

export interface PortConfig {
    counts: number[];
};

// Describes legal component configurations.
// NOTE: The configuration wherein each port group has zero ports is IMPLICITLY LEGAL.
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
    let countMap = new Map(info.portGroups.map(g => [g, Number(0)]));
    for (const p of ports) {
        let count = countMap.get(p.group);
        if (count === undefined)
            return false;
        count++;
    }
    let counts: number[] = info.portGroups.map(g => countMap.get(g) ?? -1);
    return info.isValidPortConfig({ counts: counts });
}

//
// Example "Digital" implementation
//

class BasicGateInfo implements ComponentInfo {
    private readonly _kind: string;

    // i.e. with thumbnail, display name, description, etc.
    public constructor(kind: string) {
        this._kind = kind;
    }

    public get kind(): string {
        return this._kind;
    }
    public readonly portGroups: string[] = ["IN", "OUT"];
    public readonly defaultPortConfig: PortConfig = ({ counts: [2, 1] });

    public isValidPortConfig(p: PortConfig): boolean {
        // At least 2 inputs, exactly 1 output
        return p.counts[0] >= 2 && p.counts[1] == 1;
    }

    public makePortsForConfig(componentID: Schema.GUID, p: PortConfig): Schema.Port[] {
        let ports: Schema.Port[] = [];
        p.counts.forEach((count, groupIdx) => {
            for (let groupPos = 0; groupPos < count; ++groupPos) {
                ports.push({
                    baseKind: "Port",
                    kind: "DigitalPort",
                    id: "", // TODO: generate

                    parent: componentID,
                    group: this.portGroups[groupIdx],
                    index: groupPos,
                    props: {},
                });
            }
        });
        return ports;
    }

    public isValidPortConnectivity(wires: Map<Schema.Port, Schema.Port[]>): boolean {
        for (const [me, o] of wires.entries()) {
            // Prevent fan-in on input ports
            if (me.group == "IN" && o.length > 1)
                return false;
        }
        return true;
    }
};
const ANDGateInfo: ComponentInfo = new BasicGateInfo("ANDGate");
const ORGateInfo: ComponentInfo = new BasicGateInfo("ORGate");
// etc...

class ExampleDigitalComponentInfoProvider implements ComponentInfoProvider {
    private map: Map<Schema.GUID, ComponentInfo>;
    public constructor() {
        this.map = new Map([
            ["ANDGate", ANDGateInfo],
            ["ORGate", ORGateInfo],
            // etc...
        ]);
    }

    get(kind: Schema.GUID): ComponentInfo | undefined {
        return this.map.get(kind)
    }
}

export function NewExampleComponentInfoProvider(): ComponentInfoProvider {
    return new ExampleDigitalComponentInfoProvider();
}
