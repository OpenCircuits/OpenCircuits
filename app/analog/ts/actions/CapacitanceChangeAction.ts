import {Action} from "core/actions/Action";
import {Capacitor} from "analog/models/eeobjects/Capacitor";

export class CapacitanceChangeAction implements Action {
    private capacitor: Capacitor;

    private initialCapacitance: number;
    private targetCapacitance: number;

    public constructor(capacitor: Capacitor, targetCapacitance: number) {
        this.capacitor = capacitor;

        this.initialCapacitance = capacitor.getCapacitance();
        this.targetCapacitance = targetCapacitance;
    }

    public execute(): Action {
        this.capacitor.setCapacitance(this.targetCapacitance);

        return this;
    }

    public undo(): Action {
        this.capacitor.setCapacitance(this.initialCapacitance);

        return this;
    }

}
