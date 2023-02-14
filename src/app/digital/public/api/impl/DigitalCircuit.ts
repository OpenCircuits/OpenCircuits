import {CircuitInternal} from "core/internal";
import {CircuitLog} from "core/internal/impl/CircuitLog";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView} from "core/internal/view/CircuitView";
import {CircuitImpl} from "core/public/api/impl/Circuit";
import {CreateDigitalComponentInfoProvider} from "digital/internal/DigitalComponents";

import {DigitalCircuit}       from "../DigitalCircuit";
import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPort}          from "../DigitalPort";
import {DigitalWire}          from "../DigitalWire";

import {DigitalComponentImpl} from "./DigitalComponent";
import {DigitalPortImpl}      from "./DigitalPort";
import {DigitalWireImpl}      from "./DigitalWire";


export class DigitalCircuitImpl extends CircuitImpl<
    DigitalComponent, DigitalWire, DigitalPort
> implements DigitalCircuit {
    public constructor() {
        const provider = CreateDigitalComponentInfoProvider();
        const circuit = new CircuitInternal(provider, new CircuitLog());
        const selections = new SelectionsManager();
        const view = new CircuitView(circuit, selections);

        super(provider, circuit, view, selections);
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
        // TODO(chuh4)
        //  Connect the ports using a "DigitalWire"
        //  See `placeComponentAt` for a similar method
        //  Note: `circuit.connectWire` CAN throw an exception, i.e.
        //         if you try to connect a port to itself or something
        //         and we should handle this HERE and return undefined
        //         in that case
        throw new Error("Unimplemented");
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
