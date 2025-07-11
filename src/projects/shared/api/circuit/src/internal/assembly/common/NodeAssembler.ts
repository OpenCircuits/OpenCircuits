import {V, Vector} from "Vector";

import {AssemblerParams, AssemblyReason}  from "../Assembler";
import {ComponentAssembler} from "../ComponentAssembler";
import {PortFactory} from "../PortAssembler";
import {Schema} from "../../../schema";


export class NodeAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams, factory: PortFactory) {
        super(params, factory, [{
            kind: "BaseShape",

            dependencies: new Set([AssemblyReason.TransformChanged]),
            assemble: (node) => ({
                kind: "Circle",

                pos:    this.getPos(node),
                radius: this.options.defaultPortRadius,
            }),

            styleChangesWhenSelected: true,
            getStyle: (node) => this.options.portStyle(this.isSelected(node.id), false).circleStyle,
        }]);
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(2*this.options.defaultPortRadius);
    }
}
