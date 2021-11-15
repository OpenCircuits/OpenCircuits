import {GroupAction} from "core/actions/GroupAction";
import {CreateReplaceComponentAction} from "core/actions/ReplaceComponentActionFactory";

import {DigitalCircuitDesigner} from "digital/models";
import {ANDGate, ORGate, XORGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {DigitalObjectSet, GetInvertedGate} from "digital/utils/ComponentUtils";
import {CreateSnipGateAction} from "../SnipGateActionFactory";


/**
 * This action replaces ANDGates, ORGates, and XORGates followed by only a NOTGate with
 *  NANDGates, NORGates, and XNORGates respectively. This action is implicitly executed on creation.
 *
 * @param designer the designer in which the action is taking place
 * @param circuit the circuit to modify, must be placed in designer
 */
export function CreateNegatedGatesAction(designer: DigitalCircuitDesigner, circuit: DigitalObjectSet): [GroupAction, DigitalObjectSet] {
    const action = new GroupAction();
    const negatedCircuit = [...circuit.toList()];

    const gates = circuit.getOthers().filter(gate =>
        (gate instanceof ANDGate || gate instanceof ORGate || gate instanceof XORGate)
    ) as (ANDGate | ORGate | XORGate)[];

    gates.forEach(gate => {
        const wires = gate.getOutputPort(0).getWires();
        if (wires.length === 1) {
            const other = wires[0].getOutputComponent();
            if (other instanceof NOTGate) {
                const newGate = GetInvertedGate(gate);

                // Remove wires and gates from negatedCircuit
                gate.getInputs().forEach(wire => negatedCircuit.splice(negatedCircuit.indexOf(wire), 1));
                negatedCircuit.splice(negatedCircuit.indexOf(wires[0]), 1);
                other.getOutputs().forEach(wire => negatedCircuit.splice(negatedCircuit.indexOf(wire), 1));
                negatedCircuit.splice(negatedCircuit.indexOf(other), 1);
                negatedCircuit.splice(negatedCircuit.indexOf(gate), 1, newGate);

                // Swap out the gates
                action.add(CreateSnipGateAction(other));
                action.add(CreateReplaceComponentAction(designer, gate, newGate));

                // Add new wires to negatedCircuit
                newGate.getInputs().forEach(wire => negatedCircuit.push(wire));
                newGate.getOutputs().forEach(wire => negatedCircuit.push(wire));
            }
        }
    });

    return [action, new DigitalObjectSet(negatedCircuit)];
}
