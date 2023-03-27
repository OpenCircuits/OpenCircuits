import {Wire} from "core/schema/Wire";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";
import {Style}             from "core/internal/view/rendering/Style";
import {WireAssembler}     from "core/internal/view/WireAssembler";

import {DigitalSim} from "../sim/DigitalSim";
import {Signal}     from "../sim/Signal";


export class DigitalWireAssembler extends WireAssembler {
    protected sim: DigitalSim;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

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

    protected override assembleCurveStyle(wire: Wire): Style {
        return this.options.wireStyle(
            this.selections.has(wire.id),
            this.getColorForWire(wire),
        );
    }
}
