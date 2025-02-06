import {V} from "Vector";

import {Schema} from "core/schema";

import {AssemblerParams, AssemblyReason}  from "./Assembler";
import {ComponentAssembler} from "./ComponentAssembler";


export class NodeAssembler extends ComponentAssembler {

    public constructor(params: AssemblerParams) {
        super(params, V(2*params.options.defaultPortRadius), {
            // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
        });
    }

    public override assemble(node: Schema.Component, reasons: Set<AssemblyReason>) {
        super.assemble(node, reasons);

        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);
        const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);

        const isSelected = this.selections.has(node.id);

        if (added || transformChanged) {
            this.cache.componentPrims.set(node.id, [{
                kind: "Circle",

                pos:    this.cache.componentTransforms.get(node.id)!.getPos(),
                radius: this.options.defaultPortRadius,

                style: this.options.portStyle(isSelected, false).circleStyle,
            }]);
        } else if (selectionChanged) {
            const [prim] = this.cache.componentPrims.get(node.id)!;

            if (prim.kind !== "Circle") {
                console.error(`Invalid prim type in NodeAssembler! ${prim.kind}`);
                return;
            }
            prim.style = this.options.portStyle(isSelected, false).circleStyle;
        }
    }
}
