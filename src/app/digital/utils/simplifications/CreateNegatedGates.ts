import { IOObject } from "core/models";
import { DigitalWire } from "digital/models";
import { ANDGate, ORGate, XORGate } from "digital/models/ioobjects";
import { NOTGate } from "digital/models/ioobjects/gates/BUFGate";
import { Gate } from "digital/models/ioobjects/gates/Gate";
import { Create } from "serialeazy";


/**
 * Gets a new instance of the inverted version of the supplied gate
 * 
 * @param oldGate the gate to get the inverted version of
 * @returns NANDGate when supplied with an ANDGate, NORGate when supplied with an ORGate,
 *              XNORGate when supplied with a XORGate, null otherwise
 */
 function getNottedGate(oldGate: Gate): Gate | null {
    if(oldGate instanceof ANDGate)
        return Create<Gate>("NANDGate");
    else if(oldGate instanceof ORGate)
        return Create<Gate>("NORGate");
    else if(oldGate instanceof XORGate)
        return Create<Gate>("XNORGate");
    else
        return null;
}

/**
 * Replaces oldGate with the inverted version of itself. oldGate must be in circuit
 *  and output to a NOTGate
 * 
 * @param oldGate the gate to replaced
 * @param circuit the circuit containing oldGate, this variable is edited in place
 * @returns the circuit with oldGate replaced by an inverted version
 * @see getNottedGate
 */
function replaceGate(oldGate: ANDGate | ORGate | XORGate,  circuit: IOObject[]): IOObject[] {
    const newGate = getNottedGate(oldGate);

    const wire1 = oldGate.getInputPort(0).getInput();
    const parent1 = wire1.getInput();
    parent1.disconnect(wire1);
    const wire2 = oldGate.getInputPort(1).getInput();
    const parent2 = wire2.getInput();
    parent2.disconnect(wire2);
    const outWire = oldGate.getOutputPort(0).getConnections()[0];
    const oldNotGate = outWire.getOutputComponent();
    const outWires = oldNotGate.getOutputPort(0).getConnections();
    const children = outWires.map(wire => wire.getOutput());
    children.forEach(child => child.disconnect());

    const newWire1 = new DigitalWire(parent1, newGate.getInputPort(0));
    newGate.getInputPort(0).connect(newWire1);
    parent1.connect(newWire1);

    const newWire2 = new DigitalWire(parent2, newGate.getInputPort(1));
    newGate.getInputPort(1).connect(newWire2);
    parent2.connect(newWire2);

    const newWires: DigitalWire[] = [];
    for(const child of children) {
        const newWireTemp = new DigitalWire(newGate.getOutputPort(0), child);
        newWires.push(newWireTemp);
        newGate.getOutputPort(0).connect(newWireTemp);
        child.connect(newWireTemp);
    }

    // Using separate splices because I don't want to rely on everything being ordered in a certain way
    for(let i = 0; i < outWires.length; i++)
        circuit.splice(circuit.indexOf(outWires[i]), 1, newWires[i]);
    circuit.splice(circuit.indexOf(wire1), 1, newWire1);
    circuit.splice(circuit.indexOf(wire2), 1, newWire2);
    circuit.splice(circuit.indexOf(oldGate), 1, newGate);
    circuit.splice(circuit.indexOf(outWire), 1);
    circuit.splice(circuit.indexOf(oldNotGate), 1);

    return circuit;
}

/**
 * Replaces AND/OR/XOR gates followed by NOT gates with NAND/NOR/XNOR gates.
 * 
 * @param circuit the circuit to process
 * @returns a copy of the circuit with the negation simplifications made
 */
export function CreateNegatedGates(circuit: IOObject[]): IOObject[] {
    let newCircuit = [...circuit];
    for(const object of circuit) {
        if(!(object instanceof ANDGate || object instanceof ORGate || object instanceof XORGate))
            continue;
        if(!object.isNot() && object.getOutputPort(0).getWires()[0].getOutputComponent() instanceof NOTGate)
            newCircuit = replaceGate(object, newCircuit);
    }
    return newCircuit;
}