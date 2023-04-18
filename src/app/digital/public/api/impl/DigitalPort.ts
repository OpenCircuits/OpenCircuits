import {GUID}     from "core/internal";
import {Port}     from "core/public";
import {PortImpl} from "core/public/api/impl/Port";
import {Signal}   from "digital/public/utils/Signal";

import {DigitalComponent, DigitalNode} from "../DigitalComponent";
import {DigitalPort}                   from "../DigitalPort";
import {DigitalWire}                   from "../DigitalWire";

import {DigitalCircuitState} from "./DigitalCircuitState";


export class DigitalPortImpl extends PortImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalNode, DigitalCircuitState
> implements DigitalPort {
    public readonly isInputPort: boolean;
    public readonly isOutputPort: boolean;

    public constructor(circuit: DigitalCircuitState, objID: GUID) {
        super(circuit, objID);

        this.isInputPort  = this.parent.info.inputPortGroups.includes(this.group);
        this.isOutputPort = this.parent.info.outputPortGroups.includes(this.group);
    }

    public get signal(): Signal {
        return this.circuit.sim.getSignal(this.id);
    }

    public override connectTo(other: DigitalPort): DigitalWire | undefined {
        // TODO(chuh4)
        //  Connect the ports using a "DigitalWire"
        //  See `placeComponentAt` for a similar method
        //  Note: `port.connectWire` CAN throw an exception, i.e.
        //         if you try to connect a port to itself or something
        //         and we should handle this HERE and return undefined
        //         in that case

        this.circuit.beginTransaction();

        const id = this.internal.connectWire("DigitalWire", this.id, other.id, {}).unwrap();

        this.circuit.commitTransaction();

        return this.circuit.constructWire(id);
    }

    public override getLegalWires(): Port.LegalWiresQuery {
        return {
            isEmpty: !this.isAvailable(),

            contains: (port: DigitalPort) => (
                this.isAvailable() &&
                // Legal connections are only input -> output or output -> input ports
                ((this.isInputPort && port.isOutputPort) ||
                 (this.isOutputPort && port.isInputPort))
            ),
        }
    }

    // returns true if a port is available, false otherwise
    public isAvailable(): boolean {
        // Output ports are always available for more connections
        if (this.isOutputPort)
            return true;

        // Input ports are only available if there isn't a connection already
        const wires = this.internal.doc.getWiresForPort(this.id).unwrap();
        return (wires.size === 0);
    }
}
