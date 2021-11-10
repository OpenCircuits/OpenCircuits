import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {ReplaceComponentAction} from "core/actions/ReplaceComponentAction";

import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {ANDGate, ORGate, XORGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {DigitalObjectSet, GetInvertedGate} from "digital/utils/ComponentUtils";
import {SnipGateAction} from "../SnipGateAction";


export class CreateNegatedGatesAction implements Action {
    private originalCircuit: DigitalComponent[];
    private negatedCircuit: DigitalComponent[];
    private action: GroupAction;

    public constructor(designer: DigitalCircuitDesigner, circuit: DigitalObjectSet) {
        this.originalCircuit = [...circuit.getComponents()];
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
                    this.action.add(new SnipGateAction(other));
                    this.negatedCircuit.splice(this.negatedCircuit.indexOf(other), 1);
                    const newGate = GetInvertedGate(gate);
                    this.action.add(new ReplaceComponentAction(designer, gate, newGate));
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
