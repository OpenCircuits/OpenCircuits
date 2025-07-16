import {CachedCircuitAPIFactoryImpl, CircuitAPIFactory, CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";

import {DigitalAPITypes} from "../DigitalCircuit";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {DigitalSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";
import {GUID} from "shared/api/circuit/schema";
import {DigitalObjInfoProvider} from "../../internal/DigitalComponents";
import {MakeDigitalCircuitAssembler} from "../../internal/assembly/DigitalCircuitAssembler";
import {DigitalComponentImpl} from "./DigitalComponent";
import {DigitalWireImpl} from "./DigitalWire";
import {DigitalPortImpl} from "./DigitalPort";
import {DigitalIntegratedCircuitImpl} from "./DigitalCircuit";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";
import {DigitalObjContainerImpl} from "./DigitalObjContainer";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {DigitalPropagators} from "../../internal/sim/DigitalPropagators";


export type DigitalTypes = CircuitTypes<DigitalAPITypes>;

export class DigitalCircuitContext extends CircuitContext<DigitalTypes> {
    public readonly assembler: CircuitAssembler;
    public readonly factory: CircuitAPIFactory<DigitalTypes>;

    public readonly sim: DigitalSim;
    public simRunner?: DigitalSimRunner;

    public constructor(id: GUID) {
        super(id, new DigitalObjInfoProvider());

        this.sim = new DigitalSim(this.internal, DigitalPropagators);
        this.assembler = MakeDigitalCircuitAssembler(this.internal, this.sim, this.renderOptions);
        this.factory = new CachedCircuitAPIFactoryImpl<DigitalTypes>({
            constructComponent: (id, icId) => new DigitalComponentImpl(this, id, icId),
            constructWire:      (id, icId) => new DigitalWireImpl(this, id, icId),
            constructPort:      (id, icId) => new DigitalPortImpl(this, id, icId),

            constructIC: (id) => new DigitalIntegratedCircuitImpl(this, id),

            constructComponentInfo: (kind) => new DigitalComponentInfoImpl(this, kind),

            constructObjContainer: (objs, icId) => new DigitalObjContainerImpl(this, objs, icId),
        });
    }
}
