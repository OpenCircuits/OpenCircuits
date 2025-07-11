import {Schema} from "shared/api/circuit/schema";

import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {Style}           from "shared/api/circuit/internal/assembly/Style";
import {WireAssembler}   from "shared/api/circuit/internal/assembly/WireAssembler";

import {Signal}     from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";


export class DigitalWireAssembler extends WireAssembler {
    protected sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params);

        this.sim = sim;
    }

    protected getColorForWire(wire: Schema.Wire): string | undefined {
        const signal = this.sim.getSignal(wire.p1);
        if (signal === Signal.On)
            return this.options.defaultOnColor;
        if (signal === Signal.Metastable)
            return this.options.defaultMetastableColor;
        return wire.props.color;
    }

    protected override getWireStyle(wire: Schema.Wire): Style {
        return this.options.wireStyle(
            this.isSelected(wire.id),
            this.getColorForWire(wire),
        );
    }

    public override assemble(wire: Schema.Wire, reasons: Set<AssemblyReason>): void {
        super.assemble(wire, reasons);

        // Update if input signal changed
        const signalsChanged = reasons.has(AssemblyReason.SignalsChanged);
        if (signalsChanged) {
            const [prim] = this.cache.wirePrims.get(wire.id)!;

            if (prim.kind !== "BezierCurve" && prim.kind !== "Line") {
                console.error(`Invalid prim type in WireAssembler! ${prim.kind}`);
                return;
            }
            prim.style = this.getWireStyle(wire);
        }
    }
}
