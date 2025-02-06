import {V, Vector} from "Vector";

import {Transform} from "math/Transform";

import {Schema} from "core/schema";

import {Assembler, AssemblerParams,
        AssemblyReason} from "./Assembler";
import {PortAssembler, PortFactory} from "./PortAssembler";


export abstract class ComponentAssembler extends Assembler<Schema.Component> {
    public readonly size: Vector;

    protected portAssembler: PortAssembler;

    public constructor(params: AssemblerParams, size: Vector, factory: PortFactory) {
        super(params);

        this.size = size;
        this.portAssembler = new PortAssembler(params, factory);
    }

    private getTransform(comp: Schema.Component) {
        return new Transform(
            V(comp.props.x ?? 0, comp.props.y ?? 0),
            this.size,
            (comp.props.angle ?? 0),
        );
    }

    public override assemble(comp: Schema.Component, reasons: Set<AssemblyReason>) {
        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);

        if (added || transformChanged)
            this.cache.componentTransforms.set(comp.id, this.getTransform(comp));
        this.portAssembler.assemble(comp, reasons);
    }
}
