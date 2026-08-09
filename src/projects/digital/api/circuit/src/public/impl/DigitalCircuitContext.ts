import { CircuitAssembler } from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {
    CachedCircuitAPIFactoryImpl,
    CircuitAPIFactory,
    CircuitContext,
} from "shared/api/circuit/public/impl/CircuitContext";
import { CircuitAPITypes } from "shared/api/circuit/public/impl/Types";
import { GUID } from "shared/api/circuit/schema";

import { DigitalSim } from "digital/api/circuit/internal/sim/DigitalSim";
import { DigitalSimRunner } from "digital/api/circuit/internal/sim/DigitalSimRunner";

import { MakeDigitalCircuitAssembler } from "../../internal/assembly/DigitalCircuitAssembler";
import { DigitalObjInfoProvider } from "../../internal/DigitalComponents";
import { DigitalPropagators } from "../../internal/sim/DigitalPropagators";
import { DigitalTypes } from "../DigitalCircuit";
import { DigitalIntegratedCircuitImpl } from "./DigitalCircuit";
import { DigitalComponentImpl } from "./DigitalComponent";
import { DigitalComponentInfoImpl } from "./DigitalComponentInfo";
import { DigitalObjContainerImpl } from "./DigitalObjContainer";
import { DigitalPortImpl } from "./DigitalPort";
import { DigitalWireImpl } from "./DigitalWire";

export type DigitalAPITypes = CircuitAPITypes<DigitalTypes>;

export class DigitalCircuitContext extends CircuitContext<DigitalAPITypes> {
    public readonly assembler: CircuitAssembler;
    public readonly factory: CircuitAPIFactory<DigitalAPITypes>;

    public readonly sim: DigitalSim;
    public simRunner?: DigitalSimRunner;

    public constructor(id: GUID) {
        super(id, new DigitalObjInfoProvider());

        this.sim = new DigitalSim(this.internal, DigitalPropagators);
        this.assembler = MakeDigitalCircuitAssembler(this.internal, this.sim, this.renderOptions);
        this.factory = new CachedCircuitAPIFactoryImpl<DigitalAPITypes>({
            constructComponent: (id, icId) => new DigitalComponentImpl(this, id, icId),
            constructWire: (id, icId) => new DigitalWireImpl(this, id, icId),
            constructPort: (id, icId) => new DigitalPortImpl(this, id, icId),

            constructIC: (id) => new DigitalIntegratedCircuitImpl(this, id),

            constructComponentInfo: (kind) => new DigitalComponentInfoImpl(this, kind),

            constructObjContainer: (objs, icId) => new DigitalObjContainerImpl(this, objs, icId),
        });
    }
}
