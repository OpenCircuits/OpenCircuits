import {V, Vector} from "Vector";

import {Schema}                          from "shared/api/circuit/schema";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler}              from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PositioningHelpers}              from "shared/api/circuit/internal/assembly/PortAssembler";

import {Signal}     from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";


export class OscilloscopeAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": (comp, index, total) => ({
                origin: V(-0.5, -PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y,
                                                                   { spacing: this.getDisplaySize(comp).y })),
                dir: V(-1, 0),
            }),
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged, AssemblyReason.PortsChanged, AssemblyReason.StateUpdated]),
                assemble:     (comp) => {
                    // Slice off first two elements which are for other state
                    const state = this.sim.getState(comp.id)?.slice(2);
                    const allSignals = state?.chunk(8) ?? [];
                    return {
                        kind:      "Group",
                        prims:     new Array(this.numPorts(comp)).fill(0).map((_, i) => this.assembleDisplay(comp, allSignals, i)),
                        ignoreHit: true,
                    }
                },

                getStyle: (_comp) => ({
                    stroke: {
                        color:    this.options.defaultOnColor,
                        size:     0.08,
                        lineCap:  "square",
                        lineJoin: "miter",
                    },
                }),
            },
        ], {
            propMapping: {
                "w": AssemblyReason.TransformChanged,
                "h": AssemblyReason.TransformChanged,
            },
            sizeChangesWhenPortsChange: true,
        });

        this.sim = sim;
    }

    protected assembleDisplay(comp: Schema.Component, allSignals: Signal[][], i: number) {
        const numPorts = this.numPorts(comp);
        const transform = this.getTransform(comp);
        const displaySize = this.getDisplaySize(comp);
        const maxSamples = (comp.props["samples"] as number) ?? 100;

        // Get y-offset for i'th graph
        const dy = -1/2 + ((numPorts - 1 - i) + 0.5) / numPorts;

        if (allSignals.length <= 1) {
            return {
                kind:      "Polygon",
                points:    [] as Vector[],
                ignoreHit: true,
            } as const;
        }

        // Calculate offset to account for border/line widths
        const offset = (0.08 + this.options.defaultBorderWidth)/2/displaySize.x;

        // Calculate the positions for each signal
        const dx = (1 - 2*offset)/(maxSamples);
        const positions = allSignals.map((s, j) => V(
            -1/2 + offset + j*dx,        // x-position: linear space
            (Signal.isOn(s[i]) ? 1/3 : -1/3) / numPorts + dy // y-position: based on signal value
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
            closed:    false,
            ignoreHit: true,
        } as const;
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
