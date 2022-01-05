import {Action} from "core/actions/Action";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ICData} from "digital/models/ioobjects/other/ICData";

export class CreateICDataAction implements Action {
    /**
     * The ICData of the action.
     */
    private data: ICData;
    /**
     * The target DigitalCircuitDesigner
     */
    private target: DigitalCircuitDesigner;

    /**
     * Initialize the Action with the data in "ICData" and target in "DigitalCircuitDesigner"
     * 
     * @param data The ICData 
     * @param target The target dessigner that we want to add ICData to it.
     */
    public constructor(data: ICData, target: DigitalCircuitDesigner) {
        this.data = data;
        this.target = target;
    }

    /**
     * Execute the action, add the ICData to the target designer.
     * 
     * @returns This action
     */
    public execute(): Action {
        this.target.addICData(this.data);
        return this;
    }

     /**
     * Undo the action, remove the ICData that added to the designer.
     * 
     * @returns This action
     */
    public undo(): Action {
        this.target.removeICData(this.data);
        return this;
    }

    public getName(): string {
        return "Create IC Data";
    }
}
