import {Action} from "./Action";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {ICData} from "../../models/ioobjects/other/ICData";

export class TransferICDataAction implements Action {
    private origin: CircuitDesigner;
    private target: CircuitDesigner;

    private data: Array<ICData>;

    public constructor(origin: CircuitDesigner, target: CircuitDesigner) {
        this.origin = origin;
        this.target = target;

        const data1 = this.origin.getICData();
        const data2 = this.target.getICData();

        // Filter out the ICs that the target doesn't already have
        this.data = data1.filter((ic) => !data2.includes(ic));
    }

    public execute(): Action {
        for (const ic of this.data)
            this.target.addICData(ic);

        return this;
    }

    public undo(): Action {
        for (const ic of this.data)
            this.target.removeICData(ic);

        return this;
    }
}
