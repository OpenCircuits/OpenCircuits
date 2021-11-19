import {Create, Deserialize, serializable, GetIDFor} from "serialeazy";

import {BCDtoDecimal} from "math/MathUtils";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";

import {DigitalComponent, DigitalWire} from "digital/models/index";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {Gate} from "digital/models/ioobjects/gates/Gate";
import {BUFGate, NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {ConnectionAction, DisconnectAction} from "core/actions/addition/ConnectionAction";
import {DeleteAction} from "core/actions/addition/PlaceAction";

/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Other             (anything else)
 *
 * Note that .getComponents() does NOT contain wires
 *  A helper method to get all the components including them
 *  is included as toList()
 */
@serializable("DigitalObjectSet")
export class DigitalObjectSet extends IOObjectSet {
    private inputs:  DigitalComponent[];
    private outputs: DigitalComponent[];
    private others:  DigitalComponent[];

    public constructor(set: IOObject[] = []) {
        super(set);

        this.inputs  = [];
        this.outputs = [];
        this.others  = [];

        // Filter out inputs and outputs
        const objs = set.filter(o => o instanceof DigitalComponent) as DigitalComponent[];
        for (const obj of objs) {
            // Input => >0 output ports and 0 input ports
            if (obj.numInputs() === 0 && obj.numOutputs() > 0)
                this.inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.numInputs() > 0 && obj.numOutputs() === 0)
                this.outputs.push(obj);
            // Component => neither just input or output
            else
                this.others.push(obj);
        }
    }

    // TODO: Remove, this is bad (ICData 228)
    public setInputs(inputs: DigitalComponent[]): void {
        this.inputs = inputs;
    }
    // TODO: Remove, this is bad (ICData 229)
    public setOthers(comps: DigitalComponent[]): void {
        this.others = comps;
    }

    public getWires(): DigitalWire[] {
        return Array.from(this.wires) as DigitalWire[];
    }

    public getInputs(): DigitalComponent[] {
        return this.inputs.slice(); // Shallow Copy
    }

    public getOutputs(): DigitalComponent[] {
        return this.outputs.slice(); // Shallow Copy
    }

    public getOthers(): DigitalComponent[] {
        return this.others.slice(); // Shallow Copy
    }

    public getComponents(): DigitalComponent[] {
        return this.inputs.concat(this.outputs, this.others);
    }
}

/**
 * Stores identifier of types of gates corresponded to their inverted counterparts
 */
const gateInversion: Record<string, string> = {
    "ANDGate": "NANDGate",
    "NANDGate": "ANDGate",
    "ORGate": "NORGate",
    "NORGate": "ORGate",
    "XORGate": "XNORGate",
    "XNORGate": "XORGate",
    "BUFGate": "NOTGate",
    "NOTGate": "BUFGate",
}

/**
 * Gets a new instance of the inverted version of the supplied gate
 * 
 * @param oldGate the gate to get the inverted version of
 * @returns NANDGate when supplied with an ANDGate, NORGate when supplied with an ORGate, etc.
 * @throws {Error} when the ID for oldGate cannot be found
 */
export function GetInvertedGate(oldGate: Gate): Gate {
    const oldName = GetIDFor(oldGate);
    if (!(oldName in gateInversion))
        throw new Error(`Failed to find gate to invert with ID: ${oldName}!`);
    const newName = gateInversion[oldName];
    return Create<Gate>(newName);
}

export function PortsToDecimal(ports: (InputPort | OutputPort)[]): number {
    return BCDtoDecimal(ports.map(p => p.getIsOn()));
}

/**
 * Connects two components together. Source must have an output and destination must have an available input.
 * The first available port of destination will be used as the input port
 * 
 * @param source the source component to connect
 * @param destination the destination component to connect
 * @returns the wire used to connect the components together
 * @throws {Error} if there is no available InputPort on destination
 */
export function LazyConnect(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    const outPort = source.getOutputPort(0);
    const inPort = destination.getInputPorts().find(port => port.getWires().length === 0);

    if (!inPort)
        throw new Error("No available InputPort on destination");

    const wire = new DigitalWire(outPort, inPort);
    inPort.connect(wire);
    outPort.connect(wire);
    return wire;
}
