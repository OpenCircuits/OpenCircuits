import {Action} from "core/actions/Action";
import { IOObject } from "core/models";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import { IC } from "digital/models/ioobjects";

export class EditICDataAction implements Action {
    private target: DigitalCircuitDesigner
    private ic: IC;
    private prevName: string;
    private newName: string;
    private prevColl: IOObject[];
    private newColl: IOObject[];

    public constructor(target: DigitalCircuitDesigner, ic: IC, prevColl: IOObject[],
                       prevName: string, newColl: IOObject[], newName?: string) {
        this.target = target;
        this.ic = ic;
        this.prevName = prevName;
        this.newName = newName ?? "";
        this.prevColl = prevColl;
        this.newColl = newColl;
    }

    public execute(): Action {
		this.ic.getData().rebuild(this.newColl, this.newName);
        this.ic.update();
        this.target.editICData(this.ic.getData());
        return this;
    }

    public undo(): Action {
        this.ic.getData().rebuild(this.prevColl, this.prevName);
        this.ic.update();
        this.target.editICData(this.ic.getData());
        return this;
    }

    public getName(): string {
        return "Edit IC Data";
    }
}
