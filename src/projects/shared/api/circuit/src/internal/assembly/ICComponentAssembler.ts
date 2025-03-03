import {Vector} from "Vector";
import {AssemblerParams, AssemblyReason} from "./Assembler";
import {PortFactory} from "./PortAssembler";
import {ComponentAssembler} from "./ComponentAssembler";


export class ICComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams, size: Vector, factory: PortFactory) {
        super(params, size, factory, [{
            kind: "BaseShape",

            dependencies: new Set([AssemblyReason.TransformChanged]),
            assemble: (comp) => ({
                kind:      "Rectangle",
                transform: this.getTransform(comp),
            }),

            styleChangesWhenSelected: true,
            getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
        }])
    }
}
