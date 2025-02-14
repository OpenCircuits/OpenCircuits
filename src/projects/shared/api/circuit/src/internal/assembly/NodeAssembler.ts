import {V} from "Vector";

import {AssemblerParams, AssemblyReason}  from "./Assembler";
import {ComponentAssembler} from "./ComponentAssembler";


export class NodeAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams) {
        super(params, V(2*params.options.defaultPortRadius), {
            // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
        }, [{
            kind: "BaseShape",

            dependencies: new Set([AssemblyReason.TransformChanged]),
            assemble: (node) => ({
                kind: "Circle",

                pos:    this.getPos(node),
                radius: this.options.defaultPortRadius,
            }),

            styleChangesWhenSelected: true,
            getStyle: (node) => this.options.portStyle(this.selections.has(node.id), false).circleStyle,
        }]);
    }
}
