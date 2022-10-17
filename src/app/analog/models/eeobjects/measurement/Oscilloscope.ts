import {serializable} from "serialeazy";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {Prop, PropInfo} from "core/models/PropInfo";

import {AnalogComponent} from "analog/models/AnalogComponent";

import {SidePositioner} from "analog/models/ports/positioners/SidePositioner";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        "samples": {
            type:  "int",
            label: "Samples",

            initial: 100, min: 0, step: 20,
        },
        "size": {
            type:    "veci",
            label:   "Display Size",
            initial: V(16, 8),
            min:     V(8, 4),
            step:    V(2, 2),
        },
    },
});

export type ScopeConfig = {
    showAxes: boolean;
    showLegend: boolean;
    showGrid: boolean;
    vecs: Record<`${string}.${string}`, {
        enabled: boolean;
        color: string;
    }>;
}

@serializable("Oscilloscope")
export class Oscilloscope extends AnalogComponent {
    private config: ScopeConfig;

    public constructor() {
        super(
            new ClampedValue(1),
            InitialProps["size"] as Vector,
            new SidePositioner("left"),
            InitialProps,
        );

        this.config = {
            showAxes:   true,
            showLegend: true,
            showGrid:   true,
            vecs:       {},
        };
    }

    public setConfig(config: ScopeConfig) {
        this.config = config;
    }

    public getConfig() {
        return this.config;
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "size") {
            this.setSize(val as Vector);
            this.onTransformChange();
            this.ports.updatePortPositions();
        }
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key] ?? super.getPropInfo(key);
    }

    public override getDisplayName(): string {
        return "Oscilloscope";
    }
}
