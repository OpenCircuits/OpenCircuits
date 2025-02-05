import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Assembler, AssemblerParams} from "core/internal/assembly/Assembler";
import {PortAssembler}              from "core/internal/assembly/PortAssembler";
import {LinePrim}                   from "core/internal/assembly/prims/LinePrim";
import {SVGPrim}                    from "core/internal/assembly/prims/SVGPrim";

import {Schema} from "core/schema";

import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";


export class ANDGateAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1, 1);

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params);

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("ANDGate") as DigitalComponentInfo;

        this.portAssembler = new PortAssembler(params, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            "inputs":  (index, total) => {
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
            },
        });
    }

    private assembleLine(gate: Schema.Component) {
        const { defaultBorderWidth } = this.options;

        const inputPortGroups = this.info.inputPortGroups;

        // Get current number of inputs
        const numInputs = [...this.circuit.doc.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.doc.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const dy = (numInputs-1)/2*(0.5 - defaultBorderWidth/2);
        const y1 = -dy - defaultBorderWidth/2;
        const y2 =  dy + defaultBorderWidth/2;

        const x = -(this.size.x - defaultBorderWidth)/2;

        const transform = this.cache.componentTransforms.get(gate.id)!;

        return new LinePrim(
            transform.toWorldSpace(V(x, y1)),
            transform.toWorldSpace(V(x, y2)),
        );
    }

    private assembleImage(gate: Schema.Component) {
        return new SVGPrim(this.size, this.cache.componentTransforms.get(gate.id)!);
    }

    public assemble(gate: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if our transform changed */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged && !portAmtChanged)
            return;

        if (transformChanged) {
            // Update transform
            this.cache.componentTransforms.set(gate.id, new Transform(
                V(gate.props.x ?? 0, gate.props.y ?? 0),
                this.size,
                (gate.props.angle ?? 0),
            ));
        }

        this.portAssembler.assemble(gate, ev);

        const [prevLine, prevImg] = (this.cache.componentPrims.get(gate.id) ?? []);

        const line = ((!prevLine || transformChanged || portAmtChanged) ? this.assembleLine(gate) : prevLine);
        const img  = ((!prevImg || transformChanged) ? this.assembleImage(gate) : prevImg);

        this.cache.componentPrims.set(gate.id, [line, img]);
    }
}
