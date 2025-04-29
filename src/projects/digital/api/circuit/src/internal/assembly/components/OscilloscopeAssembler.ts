import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";

import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {Transform} from "math/Transform";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PolygonPrim} from "shared/api/circuit/internal/assembly/Prim";


export class OscilloscopeAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": (comp, index, total) => {
                const size = this.getSize(comp);
                const midpoint = (total - 1) / 2;
                const y = -0.6 * size.y/2 * (index - midpoint);
                return {
                    // Subtracting the this.options.defaultBorderWidth prevent tiny gap between port stem and component
                    origin: V(-((size.x - this.options.defaultBorderWidth)/2), y),
                    target: V(-(this.options.defaultPortLength + size.x/2), y),
                };
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged, AssemblyReason.StateUpdated]),
                assemble:     (comp) => {
                    const allSignals = this.sim.getState(comp.id)?.chunk(8) ?? [];
                    return {
                        kind:      "Group",
                        prims:     new Array(this.numPorts(comp)).fill(0).map((_, i) => this.assembleDisplay(comp, allSignals, i)),
                        ignoreHit: true,
                    }
                },

                getStyle: (_comp) => ({
                    stroke: {
                        color:   this.options.defaultOnColor,
                        size:    0.08,
                        lineCap: "square",
                    },
                }),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Oscilloscope").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected assembleDisplay(comp: Schema.Component, allSignals: Signal[][], i: number): Omit<PolygonPrim, "style"> {
        const numPorts = this.numPorts(comp);
        const transform = this.getTransform(comp);
        const displaySize = this.getDisplaySize(comp);
        const size = this.getSize(comp);
        const maxSamples = (comp.props["samples"] as number) ?? 100;

        // Get y-offset for i'th graph
        const dy = -size.y/2 + ((numPorts - 1 - i) + 0.5)*displaySize.y;

        if (allSignals.length <= 1) {
            return {
                kind:   "Polygon",
                points: [],
            };
        }

        // Calculate offset to account for border/line widths
        const offset = (0.08 + this.options.defaultBorderWidth)/2;

        // Calculate the positions for each signal
        const dx = (size.x - 2*offset)/(maxSamples - 1);
        const positions = allSignals.map((s, j) => V(
            -displaySize.x/2 + offset + j*dx,        // x-position: linear space
            displaySize.y * (Signal.isOn(s[i]) ? 1/3 : -1/3) + dy // y-position: based on signal value
        ));

        return {
            kind:   "Polygon",
            points: [positions[0], ...positions.flatMap((pos, j) => {
                // Draws a vertical line so that the jump looks better
                //  from 0 -> 1 or 1 -> 0
                if (j > 0 && allSignals[j-1][i] !== allSignals[j][i])
                    return [pos, pos.add(dx, 0)];
                return pos.add(dx, 0);
            })].map((p) => transform.toWorldSpace(p)),
            closed: false,
        };
    }

    protected override getSize(comp: Schema.Component): Vector {
        const displaySize = this.getDisplaySize(comp);
        return V(displaySize.x, displaySize.y * this.numPorts(comp));
    }

    protected numPorts(comp: Schema.Component): number {
        return this.circuit.getPortsForComponent(comp.id).unwrap().size;
    }

    private getDisplaySize(comp: Schema.Component) {
        const c = this.circuit.getCompByID(comp.id).unwrap();
        return V(
            (c.props["w"] as number) ?? 8,
            (c.props["h"] as number) ?? 4,
        );
    }
}
