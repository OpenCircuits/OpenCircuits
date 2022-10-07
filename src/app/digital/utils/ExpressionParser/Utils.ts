import {DigitalComponent} from "digital/models/DigitalComponent";


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
    for (const [name, component] of inputs) {
        if (component.getInputPortCount().getValue() !== 0 || component.getOutputPortCount().getValue() === 0)
            throw new Error("Not An Input: \"" + name + "\"");
    }
    if (output.getInputPortCount().getValue() === 0 || output.getOutputPortCount().getValue() !== 0)
        throw new Error("Supplied Output Is Not An Output");
}
