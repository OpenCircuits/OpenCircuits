import {Action} from "core/actions/Action";
import {Battery} from "analog/models/eeobjects/Battery";

export class VoltageChangeAction implements Action {
    private battery: Battery;

    private initialVoltage: number;
    private targetVoltage: number;

    public constructor(battery: Battery, targetResistance: number) {
        this.battery = battery;

        this.initialVoltage = battery.getVoltage();
        this.targetVoltage = targetResistance;
    }

    public execute(): Action {
        this.battery.setVoltage(this.targetVoltage);

        return this;
    }

    public undo(): Action {
        this.battery.setVoltage(this.initialVoltage);

        return this;
    }

}
