import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {CreateReplaceComponentAction} from "core/actions/ReplaceComponentActionFactory";
import {IOObject} from "core/models";

import {DigitalCircuitDesigner} from "digital/models";
import {ANDGate, ORGate, XORGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {DigitalObjectSet, GetInvertedGate} from "digital/utils/ComponentUtils";
import {CreateSnipGateAction} from "../SnipGateActionFactory";


/**
 * This action replaces ANDGates, ORGates, and XORGates followed by only a NOTGate with
 *  NANDGates, NORGates, and XNORGates respectively. This action is implicitly executed on creation.
 */
export class CreateNegatedGatesAction implements Action {
    private originalCircuit: IOObject[];
    private negatedCircuit: IOObject[];
    private action: GroupAction;

    /**
     * Creates the action and implicitly executes it
     * 
     * @param designer the designer in which the action is taking place
     * @param circuit the circuit to modify, must be placed in designer
     */
    public constructor(designer: DigitalCircuitDesigner, circuit: DigitalObjectSet) {
        this.originalCircuit = [...circuit.toList()];
        this.negatedCircuit = [...this.originalCircuit];
        this.action = new GroupAction();

        const gates = circuit.getOthers().filter(gate =>
            (gate instanceof ANDGate || gate instanceof ORGate || gate instanceof XORGate)
        ) as (ANDGate | ORGate | XORGate)[];

        gates.forEach(gate => {
            const wires = gate.getOutputPort(0).getWires();
            if (wires.length === 1) {
                const other = wires[0].getOutputComponent();
                if (other instanceof NOTGate) {
                    this.action.add(CreateSnipGateAction(other));
                    this.negatedCircuit.splice(this.negatedCircuit.indexOf(other), 1);
                    const newGate = GetInvertedGate(gate);
                    this.action.add(CreateReplaceComponentAction(designer, gate, newGate));
                    this.negatedCircuit.splice(this.negatedCircuit.indexOf(gate), 1, newGate);
                }
            }
        });
    }

    public execute(): Action {
        this.action.execute();

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }

    public getOriginalCircuit(): DigitalObjectSet {
        return new DigitalObjectSet(this.originalCircuit);
    }

    public getNegatedCircuit(): DigitalObjectSet {
        return new DigitalObjectSet(this.negatedCircuit);
    }
}
