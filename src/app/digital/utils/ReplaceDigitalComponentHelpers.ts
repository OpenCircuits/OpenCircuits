import {Create} from "serialeazy";

import {DigitalComponent} from "digital/models";

import {ICData} from "digital/models/ioobjects";

import {Mux} from "digital/models/ioobjects/other/Mux";


/**
 * This function checks if a component can be used to replace another component.
 * If it can, then true is returned, otherwise return false.
 * A replacement is considered valid if the replacement has as many input ports as the original has in use and
 * as many output ports as the original has in use (in use defined as having 1+ wire(s) connected).
 * Select ports are counted as input ports.
 *
 * @param original    The component to be replaced.
 * @param replacement The ID or ICData to try to replace against the .
 * @returns             An instance, of the DigitalComponent that can replace, the ICData if it can replace,
 *              or null if replacement can not replace.
 */
 export function CanReplace(original: DigitalComponent, replacement: string | ICData): boolean {
    const origInputs = original instanceof Mux
                       ? [...original.getInputPorts(), ...original.getSelectPorts()]
                       : original.getInputPorts();
    const origOutputs = original.getOutputPorts();
    const numInputsInUse = origInputs.filter(port => port.getWires().length > 0).length;
    const numOutputsInUse = origOutputs.filter(port => port.getWires().length > 0).length;

    if (replacement instanceof ICData)
        return replacement.getInputCount() >= numInputsInUse && replacement.getOutputPortCount() >= numOutputsInUse;

    const replacementComponent = Create<DigitalComponent>(replacement);
    let maxInputs = replacementComponent.getInputPortCount().getMaxValue();
    if (replacementComponent instanceof Mux)
        maxInputs += replacementComponent.getSelectPortCount().getMaxValue();
    const maxOutputs = replacementComponent.getOutputPortCount().getMaxValue();

    return maxInputs >= numInputsInUse && maxOutputs >= numOutputsInUse;
}