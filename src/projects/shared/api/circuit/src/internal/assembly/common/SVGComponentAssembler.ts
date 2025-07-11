import {Vector} from "Vector";

import {ComponentExtraAssemblerParams} from "../ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "../Assembler";
import {PortFactory} from "../PortAssembler";
import {StaticComponentAssembler} from "./StaticComponentAssembler";


// Utility class for statically-sized components with a single image prim.
export class SVGComponentAssembler extends StaticComponentAssembler {
    public constructor(
        params: AssemblerParams,
        factory: PortFactory,
        size: Vector,
        svg: string,
        otherParams: ComponentExtraAssemblerParams = {},
    ) {
        super(params, factory, [
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     () => ({ kind: "SVG", svg }),

                tintChangesWhenSelected: true,

                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ], size, otherParams);
    }
}
