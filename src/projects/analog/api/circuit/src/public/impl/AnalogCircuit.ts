import {GUID} from "shared/api/circuit/public";
import {CachedCircuitAPIFactoryImpl, CircuitAPIFactory, CircuitContext} from "shared/api/circuit/public/impl/CircuitContext";
import {CircuitImpl} from "shared/api/circuit/public/impl/Circuit";
import {IntegratedCircuitImpl} from "shared/api/circuit/public/impl/IntegratedCircuit";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";

import {AnalogObjInfoProvider}      from "analog/api/circuit/internal/AnalogComponents";
import {MakeAnalogCircuitAssembler} from "analog/api/circuit/internal/assembly/AnalogCircuitAssembler";

import {ComponentImpl} from "shared/api/circuit/public/impl/Component";
import {WireImpl} from "shared/api/circuit/public/impl/Wire";
import {PortImpl} from "shared/api/circuit/public/impl/Port";
import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";
import {CircuitAPITypes} from "shared/api/circuit/public/impl/Types";
import {AnalogCircuit, AnalogTypes} from "../AnalogCircuit";
import {AnalogSim} from "../AnalogSim";
import {CircuitInternal} from "shared/api/circuit/internal";


export type AnalogAPITypes = CircuitAPITypes<AnalogTypes>;

export class AnalogCircuitContext extends CircuitContext<AnalogAPITypes> {
    public readonly assembler: CircuitAssembler;
    public readonly factory: CircuitAPIFactory<AnalogAPITypes>;

    public sim?: AnalogSim;

    public constructor(id: GUID) {
        super(id, new AnalogObjInfoProvider());

        this.assembler = MakeAnalogCircuitAssembler(this.internal, this.renderOptions);
        this.factory = new CachedCircuitAPIFactoryImpl({
            constructComponent: (id, icId) => new ComponentImpl(this, id, icId),
            constructWire:      (id, icId) => new WireImpl(this, id, icId),
            constructPort:      (id, icId) => new PortImpl(this, id, icId),

            constructIC: (id) => new IntegratedCircuitImpl(this, id),

            constructComponentInfo: (kind) => new ComponentInfoImpl(this, kind),

            constructObjContainer: (objs, icId) => new ObjContainerImpl(this, objs, icId),
        });
    }
}

export class AnalogCircuitImpl extends CircuitImpl<AnalogAPITypes> implements AnalogCircuit {
    protected override readonly ctx: AnalogCircuitContext;

    public constructor(id: GUID) {
        const ctx = new AnalogCircuitContext(id);
        super(ctx, new SelectionsImpl(ctx));

        this.ctx = ctx;
    }

    public get sim(): AnalogSim | undefined {
        return this.ctx.sim;
    }

    public attachSim(makeSim: (circuit: CircuitInternal) => AnalogSim): void {
        this.ctx.sim = makeSim(this.ctx.internal);
    }
}
