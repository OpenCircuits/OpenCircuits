import {Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {ComponentAssembler, ComponentExtraAssemblerParams, ComponentPrimAssembly} from "../ComponentAssembler";
import {AssemblerParams} from "../Assembler";
import {PortFactory} from "../PortAssembler";


// Utility class for statically-sized components so that they don't need to overwrite the method.
export class StaticComponentAssembler extends ComponentAssembler {
    protected readonly size: Vector;

    public constructor(
        params: AssemblerParams,
        factory: PortFactory,
        primAssembly: ComponentPrimAssembly[],
        size: Vector,
        otherParams: ComponentExtraAssemblerParams = {},
    ) {
        super(params, factory, primAssembly, otherParams);

        this.size = size;
    }

    protected override getSize(_comp: Schema.Component): Vector {
        return this.size;
    }
}
