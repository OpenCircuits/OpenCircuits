import {GroupAction} from "core/actions/GroupAction";

import {Connect, Disconnect} from "core/actions/units/Connect";
import {Delete}              from "core/actions/units/Place";

import {BUFGate} from "digital/models/ioobjects";

import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";


/**
 * This action is used to remove a BUFGate or NOTGate while creating new wires from the component
 *  inputting into the gate. This action is implicitly executed upon creation.
 *
 * @param    gate The gate to remove.
 * @returns       A GroupAction containing the actions required to snip the gate.
 * @throws {Error} If gate is not placed in a designer.
 */
export function SnipGate(gate: BUFGate | NOTGate): GroupAction {
    const action = new GroupAction([], "Snip Gate Action");
    const designer = gate.getDesigner();
    if (!designer)
        throw new Error("gate not placed in designer");

    const inputs = gate.getInputs();
    const outputs = gate.getOutputs();

    if (inputs.length === 0 || outputs.length === 0) {
        action.add(Delete(designer, gate));
        return action;
    }

    const inputWire = inputs[0];
    const outputWires = outputs;

    const prevPort = inputWire.getInput();
    action.add(Disconnect(designer, inputWire));
    for (const wire of outputWires) { // Typescript gives error on .add() if this is a .forEach() loop
        const newPort = wire.getOutput();
        action.add(Disconnect(designer, wire));
        action.add(Connect(designer, prevPort, newPort));
    }
    action.add(Delete(designer, gate));

    return action;
}
