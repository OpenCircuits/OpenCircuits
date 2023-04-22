import {CircuitInternal}                    from "core/internal";
import {CircuitLog}                         from "core/internal/impl/CircuitLog";
import {SelectionsManager}                  from "core/internal/impl/SelectionsManager";
import {CircuitImpl}                        from "core/public/api/impl/Circuit";
import {CreateDigitalComponentInfoProvider} from "digital/internal/DigitalComponents";
import {DigitalSim}                         from "digital/internal/sim/DigitalSim";
import {DigitalCircuitView}                 from "digital/internal/views/DigitalCircuitView";

import {DigitalCircuit}       from "../DigitalCircuit";
import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";
import {DigitalCircuitState}  from "./DigitalCircuitState";

import {DigitalComponentImpl} from "./DigitalComponent";
import {DigitalPortImpl}      from "./DigitalPort";
import {DigitalWireImpl}      from "./DigitalWire";


export class DigitalCircuitImpl extends CircuitImpl<
    DigitalComponent, DigitalWire, DigitalPort
> implements DigitalCircuit, DigitalCircuitState {
    public sim: DigitalSim;

    public constructor() {
        const circuit = new CircuitInternal(CreateDigitalComponentInfoProvider(), new CircuitLog());
        const selections = new SelectionsManager();
        const sim = new DigitalSim(circuit);
        const view = new DigitalCircuitView(circuit, selections, sim);

        super(circuit, view, selections);

        this.sim = sim;
    }

    public constructComponent(id: string): DigitalComponent {
        return new DigitalComponentImpl(this, id);
    }
    public constructWire(id: string): DigitalWire {
        return new DigitalWireImpl(this, id);
    }
    public constructPort(id: string): DigitalPort {
        return new DigitalPortImpl(this, id);
    }

    public connectWire(p1: DigitalPort, p2: DigitalPort): DigitalWire | undefined {
        this.circuit.beginTransaction();
        
        // Create a new raw Wire to connect ports
        const wire = this.circuit.connectWire("DigitalWire", p1.id, p2.id, {})
                         .map((id) => {
                            this.circuit.commitTransaction();
                            return this.constructWire(id);
                         });
                            
        return wire.ok ? wire.value : undefined;
    }

    public set propagationTime(val: number) {
        throw new Error("Unimplemented");
    }
    public get propagationTime(): number {
        throw new Error("Unimplemented");
    }

    public override getComponentInfo(kind: string): DigitalComponentInfo | undefined {
        throw new Error("Unimplmeneted");
    }
}
