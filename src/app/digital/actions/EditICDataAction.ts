import {Action} from "core/actions/Action";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ICData} from "digital/models/ioobjects/other/ICData";

export class EditICDataAction implements Action {
    private prevData: ICData;
    private newData: ICData;
    private target: DigitalCircuitDesigner;

    public constructor(prevData: ICData, newData: ICData, target: DigitalCircuitDesigner) {
        this.prevData = prevData;
		this.newData = newData;
        this.target = target;
    }

    public execute(): Action { // TODO don't think this works how i think it will
		this.target.removeICData(this.prevData);
        this.target.addICData(this.newData);
        return this;
    }

    public undo(): Action { // TODO how????? save prev data??? elephant
        this.target.removeICData(this.prevData);
        return this;
    }

    public getName(): string {
        return "Edit IC Data";
    }
}
