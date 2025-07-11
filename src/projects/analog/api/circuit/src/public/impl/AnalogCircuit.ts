import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";
import {GUID, Port, ReadonlyICPin} from "shared/api/circuit/public";
import {CachedCircuitAPIFactoryImpl, CircuitAPIFactory, CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {CircuitImpl, IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {AnalogObjInfoProvider} from "../../internal/AnalogComponents";
import {MakeAnalogCircuitAssembler} from "../../internal/assembly/AnalogCircuitAssembler";
import {ComponentImpl} from "shared/api/circuit/public/impl/Component";
import {WireImpl} from "shared/api/circuit/public/impl/Wire";
import {PortImpl} from "shared/api/circuit/public/impl/Port";
import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";


export class AnalogCircuitContext extends CircuitContext<CircuitTypes> {
    public readonly assembler: CircuitAssembler;
    public readonly factory: CircuitAPIFactory<CircuitTypes>;

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

export class AnalogCircuitImpl extends CircuitImpl<CircuitTypes> {
    public constructor(id: GUID) {
        const ctx = new AnalogCircuitContext(id);
        super(ctx, new SelectionsImpl(ctx));
    }
}
