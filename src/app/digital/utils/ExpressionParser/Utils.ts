import { DigitalComponent } from "digital/models/DigitalComponent";
import { DigitalWire } from "digital/models/DigitalWire";
import { Token } from "./Constants/DataStructures";


/**
 * Connects two components together. Source must have an output and destination must have an available input.
 * 
 * @param source the source component to connect
 * @param destination the destination component to connect
 * @returns the wire used to connect the components together
 */
 export function ConnectGate(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    const outPort = source.getOutputPort(0);
    let inPort = destination.getInputPort(0);
    if (inPort.getWires().length > 0)
        inPort = destination.getInputPort(1);
    const wire = new DigitalWire(outPort, inPort);
    inPort.connect(wire);
    outPort.connect(wire);
    return wire;
}

/**
 * Used to check if the given token represents an operator (&, ^, |, or !)
 * 
 * @param token the token to check
 * @returns true if token's type is &, ^, |, or !, false otherwise
 */
export function IsOperator(token: Token) {
    switch(token.type) {
    case "&":
    case "^":
    case "|":
    case "!":
        return true;
    }
    return false;
}

/**
 * Validates that the given inputs are inputs (thus have 0 input ports and at least 1 output ports)
 *  and the output is an outputs (thus have at least one input port and 0 output ports)
 * 
 * @param inputs a map containing the input components to verify
 * @param output the output component to verify
 * @throws {Error} if one of the inputs has an input port or has no output ports
 * @throws {Error} if the output has no input ports or an output port
 */
export function ValidateInputOutputTypes(inputs: Map<string, DigitalComponent>, output: DigitalComponent) {
    for(const [name, component] of inputs) {
        if (component.getInputPortCount().getValue() !== 0 || component.getOutputPortCount().getValue() === 0)
            throw new Error("Not An Input: \"" + name + "\"");
    }
    if (output.getInputPortCount().getValue() === 0 || output.getOutputPortCount().getValue() !== 0)
        throw new Error("Supplied Output Is Not An Output");
}