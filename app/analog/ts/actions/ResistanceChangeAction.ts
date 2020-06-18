import {Action} from "core/actions/Action";
import {Resistor} from "analog/models/eeobjects/Resistor";

export class ResistanceChangeAction implements Action {
    private resistor: Resistor;

    private initialResistance: number;
    private targetResistance: number;

    public constructor(resistor: Resistor, targetResistance: number) {
        this.resistor = resistor;

        this.initialResistance = resistor.getResistance();
        this.targetResistance = targetResistance;
    }

    public execute(): Action {
        this.resistor.setResistance(this.targetResistance);

        return this;
    }

    public undo(): Action {
        this.resistor.setResistance(this.initialResistance);

        return this;
    }

}
