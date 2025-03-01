import {Wire} from "shared/api/circuit/schema/Wire";

import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {Style}           from "shared/api/circuit/internal/assembly/Style";
import {WireAssembler}   from "shared/api/circuit/internal/assembly/WireAssembler";

import {DigitalSim} from "../sim/DigitalSim";
import {Signal}     from "../sim/Signal";


export class DigitalWireAssembler extends WireAssembler {
    protected sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params);

        this.sim = sim;
    }

    protected getColorForWire(wire: Wire): string | undefined {
        const signal = this.sim.getSignal(wire.p1);
        if (signal === Signal.On)
            return this.options.defaultOnColor;
        if (signal === Signal.Metastable)
            return this.options.defaultMetastableColor;
        return wire.props.color;
    }

    protected override getWireStyle(wire: Wire): Style {
        return this.options.wireStyle(
            this.isSelected(wire.id),
            this.getColorForWire(wire),
        );
    }
}
