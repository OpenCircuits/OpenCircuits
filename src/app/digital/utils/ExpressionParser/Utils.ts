import {DigitalComponent, DigitalWire} from "core/models/types/digital";


/**
 * Stores identifier of types of gates corresponded to their inverted counterparts.
 */
const gateInversion = {
    "ANDGate":  "NANDGate",
    "NANDGate": "ANDGate",
    "ORGate":   "NORGate",
    "NORGate":  "ORGate",
    "XORGate":  "XNORGate",
    "XNORGate": "XORGate",
    "BUFGate":  "NOTGate",
    "NOTGate":  "BUFGate",
} as const;

/**
 * Gets the string id of the inverted version of the supplied gate.
 *
 * @param oldGate The gate to get the inverted version of.
 * @returns       `NANDGate` when supplied with an ANDGate, `NORGate` when supplied with an ORGate, etc.
 * @throws When the ID for oldGate cannot be found.
 */
export function GetInvertedGate(oldGate: DigitalComponent): string {
    // @TODO
    return "";
    // const oldName = GetIDFor(oldGate);
    // if (!oldName || !(oldName in gateInversion))
    //     throw new Error(`Failed to find gate to invert with ID: ${oldName}`);
    // return gateInversion[oldName];
}

/**
 * Connects two components together. Source must have an output and destination must have an available input.
 * The first available port of destination will be used as the input port.
 *
 * @param    source      The source component to connect.
 * @param    destination The destination component to connect.
 * @returns              The wire used to connect the components together.
 * @throws {Error} If there is no available InputPort on destination.
 */
export function LazyConnect(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    // @TODO
    return undefined as any;
    // const outPort = source.getOutputPort(0);
    // const inPort = destination.getInputPorts().find((port) => port.getWires().length === 0);

    // if (!inPort)
    //     throw new Error("No available InputPort on destination");

    // const wire = new DigitalWire(outPort, inPort);
    // inPort.connect(wire);
    // outPort.connect(wire);
    // return wire;
}


/**
 * Validates that the given inputs are inputs (thus have 0 input ports and at least 1 output ports)
 *  and the output is an outputs (thus have at least one input port and 0 output ports).
 *
 * @param  inputs A map containing the input components to verify.
 * @param  output The output component to verify.
 * @throws {Error} If one of the inputs has an input port or has no output ports.
 * @throws {Error} If the output has no input ports or an output port.
 */
export function ValidateInputOutputTypes(inputs: Map<string, DigitalComponent>, output: DigitalComponent) {
    // @TODO
    // for (const [name, component] of inputs) {
    //     if (component.getInputPortCount().getValue() !== 0 || component.getOutputPortCount().getValue() === 0)
    //         throw new Error("Not An Input: \"" + name + "\"");
    // }
    // if (output.getInputPortCount().getValue() === 0 || output.getOutputPortCount().getValue() !== 0)
    //     throw new Error("Supplied Output Is Not An Output");
}
