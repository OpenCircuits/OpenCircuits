import {Action} from "core/actions/Action";

import {ReversableAction} from "core/actions/bases/ReversableAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ICData} from "digital/models/ioobjects/other/ICData";


class AddICDataAction extends ReversableAction {
    /**
     * The ICData of the action.
     */
    private readonly data: ICData;
    /**
     * The target DigitalCircuitDesigner.
     */
    private readonly target: DigitalCircuitDesigner;

    /**
     * Initialize the Action with the data in "ICData" and target in "DigitalCircuitDesigner".
     *
     * @param data   The ICData.
     * @param target The target dessigner that we want to add ICData to it.
     * @param flip   A boolean to mark if this should be a deletion action.
     */
    public constructor(data: ICData, target: DigitalCircuitDesigner, flip = false) {
        super(flip);

        this.data = data;
        this.target = target;

        this.execute();
    }

    /**
     * Execute the action, add the ICData to the target designer.
     *
     * @returns This action.
     */
    public override normalExecute(): Action {
        this.target.addICData(this.data);
        return this;
    }

     /**
      * Undo the action, remove the ICData that added to the designer.
      *
      * @returns This action.
      */
    public override normalUndo(): Action {
        this.target.removeICData(this.data);
        return this;
    }

    public getName(): string {
        return "Create IC Data";
    }
}

export function AddICData(data: ICData, target: DigitalCircuitDesigner) {
    return new AddICDataAction(data, target);
}
export function RemoveICData(data: ICData, target: DigitalCircuitDesigner) {
    return new AddICDataAction(data, target, true);
}
