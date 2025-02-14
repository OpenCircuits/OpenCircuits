import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal}   from "shared/api/circuit/internal";
import {SelectionsManager} from "shared/api/circuit/internal/impl/SelectionsManager";
import {CircuitView}       from "shared/api/circuit/internal/view/CircuitView";
import {PortAssembler}     from "shared/api/circuit/internal/view/PortAssembler";
import {SVGPrim}           from "shared/api/circuit/internal/view/rendering/prims/SVGPrim";
import {Assembler}         from "shared/api/circuit/internal/view/Assembler";

import {Signal}        from "digital/internal/sim/Signal";
import {DigitalSim}    from "digital/internal/sim/DigitalSim";
import {RectanglePrim} from "shared/api/circuit/internal/view/rendering/prims/RectanglePrim";
import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";


export class SwitchAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1.24, 1.54);
    public readonly pressableSize = V(0.96, 1.2);

    protected readonly sim: DigitalSim;

    public onImg?: SVGDrawing;
    public offImg?: SVGDrawing;

    protected portAssembler: PortAssembler;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params);

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

        this.portAssembler = new PortAssembler(params, {
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
