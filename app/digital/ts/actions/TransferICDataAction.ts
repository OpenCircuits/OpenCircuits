import {Action} from "core/actions/Action";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ICData} from "digital/models/ioobjects/other/ICData";

export class TransferICDataAction implements Action {
    private origin: DigitalCircuitDesigner;
    private target: DigitalCircuitDesigner;

    private data: Array<ICData>;

    public constructor(origin: DigitalCircuitDesigner, target: DigitalCircuitDesigner) {
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
