import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Schema} from "core/schema";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";
import {PortAssembler}     from "core/internal/view/PortAssembler";
import {SVGPrim}           from "core/internal/view/rendering/prims/SVG";
import {Style}             from "core/internal/view/rendering/Style";
import {Assembler}         from "core/internal/view/Assembler";

import {Signal}     from "digital/internal/sim/Signal";
import {DigitalSim} from "digital/internal/sim/DigitalSim";
import {Rectangle}  from "core/internal/view/rendering/prims/Rectangle";


export class SwitchAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1.24, 1.54);
    public readonly pressableSize = V(0.96, 1.2);

    public readonly onImg: SVGDrawing;
    public readonly offImg: SVGDrawing;

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        this.onImg  = view.options.getImage("switchDown.svg")!;
        this.offImg = view.options.getImage("switchUp.svg")!;

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "outputs": () => ({ origin: V(0.62, 0), dir: V(1, 0) }),
        });
    }

    private isOn(sw: Schema.Component) {
        const [outputPort] = this.circuit.getPortsForComponent(sw.id).unwrap();
        return Signal.isOn(this.sim.getSignal(outputPort));
    }

    private assembleBackgroundStyle(sw: Schema.Component) {
        return this.options.fillStyle(this.selections.has(sw.id));
    }

    private assembleBackground(sw: Schema.Component) {
        return new Rectangle(
            this.view.componentTransforms.get(sw.id)!,
            this.assembleBackgroundStyle(sw),
        );
    }

    private assembleImageTint(sw: Schema.Component) {
        return (this.selections.has(sw.id) ? this.options.selectedFillColor : undefined);
    }

    private assembleImage(sw: Schema.Component) {
        const img = (this.isOn(sw) ? this.onImg : this.offImg);
        return new SVGPrim(
            img,
            this.pressableSize, this.view.componentTransforms.get(sw.id)!,
            this.assembleImageTint(sw),
        );
    }

    public assemble(sw: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if our transform changed */ true;
        const selectionChanged = /* use ev to see if we were de/selected */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged && !selectionChanged && !portAmtChanged)
            return;

        if (transformChanged) {
            // Update transform
            this.view.componentTransforms.set(sw.id, new Transform(
                V(sw.props.x ?? 0, sw.props.y ?? 0),
                this.size,
                (sw.props.angle ?? 0),
            ));
        }

        this.portAssembler.assemble(sw, ev);

        const [prevBg, prevImg] = (this.view.componentPrims.get(sw.id) ?? []);

        const bg  = ((!prevBg || transformChanged) ? this.assembleBackground(sw) : prevBg);
        const img = ((!prevImg || transformChanged) ? this.assembleImage(sw) : prevImg);

        // Update styles only if only selections changed
        if (selectionChanged) {
            bg.updateStyle(this.assembleBackgroundStyle(sw));
            img.updateStyle({ fill: this.assembleImageTint(sw) });
        }

        this.view.componentPrims.set(sw.id, [bg, img]);
    }

}
