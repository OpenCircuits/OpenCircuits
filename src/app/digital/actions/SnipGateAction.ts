import {Action} from "core/actions/Action";
import {DisconnectAction, ConnectionAction} from "core/actions/addition/ConnectionAction";
import {DeleteAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";
import {DigitalCircuitDesigner, DigitalWire} from "digital/models";

import {BUFGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";


/**
 * This action is used to remove a BUFGate or NOTGate while creating new wires from the component
 *  inputting into the gaate
 */
 export class SnipGateAction implements Action {
    private designer: DigitalCircuitDesigner;
    private gate: BUFGate | NOTGate;
    private action: GroupAction | DeleteAction;
    private inputWire?: DigitalWire;
    private outputWires?: DigitalWire[];

    /**
     * Initializes the action
     * 
     * @param gate the gate to remove
     * @throws {Error} if gate is not placed in a designer
     */
    public constructor(gate: BUFGate | NOTGate) {
        this.designer = gate.getDesigner();
        if(!this.designer)
            throw new Error("gate not placed in designer");

        this.gate = gate;

        const inputs = this.gate.getInputs();
        const outputs = this.gate.getOutputs();

        if (inputs.length === 0 || outputs.length === 0) {
            this.action = new DeleteAction(this.designer, this.gate);
        } else {
            // Can't add all actions to GroupAction yet because ConnectionAction would
            //  try to connect a wire to an input port that already has a wire
            this.action = new GroupAction();
            this.inputWire = inputs[0];
            this.outputWires = [...outputs];
        }
    }

    public execute(): Action {
        if (this.action instanceof GroupAction && this.action.isEmpty()) {
            // GroupAction is initialized here because all actions need to be executed prior to being added
            //  or else DigitalWire creation can fail
            const prevPort = this.inputWire.getInput();
            this.action.add(new DisconnectAction(this.designer, this.inputWire).execute());
            for (const wire of this.outputWires) { // Typescript gives error on .add() if this is a .forEach() loop
                const newPort = wire.getOutput();
                this.action.add(new DisconnectAction(this.designer, wire).execute());
                this.action.add(new ConnectionAction(this.designer, prevPort, newPort).execute());
            }
            this.action.add(new DeleteAction(this.designer, this.gate).execute());
        } else {
            this.action.execute();
        }

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }
}