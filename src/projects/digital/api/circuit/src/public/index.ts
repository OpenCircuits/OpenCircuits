import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {DigitalObjInfoProvider} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit} from "./DigitalCircuit";

import {DigitalCircuitImpl, DigitalIntegratedCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitContext}    from "./impl/DigitalCircuitContext";
import {DigitalComponentInfoImpl} from "./impl/DigitalComponentInfo";
import {DigitalPropagators} from "../internal/sim/DigitalPropagators";
import {DigitalObjContainerImpl} from "./impl/DigitalObjContainer";


export * from "./DigitalCircuit";
export * from "./DigitalComponent";
export * from "./DigitalComponentInfo";
export * from "./DigitalPort";
export * from "./DigitalWire";
export * from "./Utilities";

export function CreateCircuit(id = uuid()): [DigitalCircuit, DigitalCircuitContext] {
    const circuit = new DigitalCircuitImpl(id);
    return [circuit, undefined as any];
}
