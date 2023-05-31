import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Schema} from "core/schema";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";
import {PortAssembler}     from "core/internal/view/PortAssembler";
import {SVGPrim}           from "core/internal/view/rendering/prims/SVGPrim";
import {Assembler}         from "core/internal/view/Assembler";

import {Signal}        from "digital/internal/sim/Signal";
import {DigitalSim}    from "digital/internal/sim/DigitalSim";
import {RectanglePrim} from "core/internal/view/rendering/prims/RectanglePrim";


export class SwitchAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1.24, 1.54);
    public readonly pressableSize = V(0.96, 1.2);

    protected readonly sim: DigitalSim;

    public onImg?: SVGDrawing;
    public offImg?: SVGDrawing;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        view.images.subscribe(({ key, val }) => {
            if (key === "switchDown.svg") {
                this.onImg = val;
                // TODO[model_refactor_api](leon) - Invalidate all AND gates to re-assemble with new image
            } else if (key === "switchUp.svg") {
                this.offImg = val;
                // TODO[model_refactor_api](leon) - Invalidate all AND gates to re-assemble with new image
            }
        });

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "outputs": () => ({ origin: V(0.62, 0), dir: V(1, 0) }),
        });
    }

    private isOn(sw: Schema.Component) {
        const [outputPort] = this.circuit.doc.getPortsForComponent(sw.id).unwrap();
        return Signal.isOn(this.sim.getSignal(outputPort));
    }

    private assembleBackgroundStyle(sw: Schema.Component) {
        return this.options.fillStyle(this.selections.has(sw.id));
    }

    private assembleBackground(sw: Schema.Component) {
        return new RectanglePrim(
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
