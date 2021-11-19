import {DisconnectAction, ConnectionAction} from "core/actions/addition/ConnectionAction";
import {DeleteAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";

import {BUFGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";


/**
 * This action is used to remove a BUFGate or NOTGate while creating new wires from the component
 *  inputting into the gate. This action is implicitly executed upon creation.
 * 
 * @param gate the gate to remove
 * @return a GroupAction containing the actions required to snip the gate
 * @throws {Error} if gate is not placed in a designer
 */
 export function CreateSnipGateAction(gate: BUFGate | NOTGate): GroupAction {
    const action = new GroupAction();
    const designer = gate.getDesigner();
    if (!designer)
        throw new Error("gate not placed in designer");
    
    const inputs = gate.getInputs();
    const outputs = gate.getOutputs();

    if (inputs.length === 0 || outputs.length === 0) {
        action.add(new DeleteAction(designer, gate).execute());
        return action;
    }

    const inputWire = inputs[0];
    const outputWires = outputs;

    const prevPort = inputWire.getInput();
    action.add(new DisconnectAction(designer, inputWire).execute());
    for (const wire of outputWires) { // Typescript gives error on .add() if this is a .forEach() loop
        const newPort = wire.getOutput();
        action.add(new DisconnectAction(designer, wire).execute());
        action.add(new ConnectionAction(designer, prevPort, newPort).execute());
    }
    action.add(new DeleteAction(designer, gate).execute());

    return action;
}