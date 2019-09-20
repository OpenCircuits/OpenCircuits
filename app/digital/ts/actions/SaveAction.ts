import {Action} from "core/actions/Action";
import {setSAVED} from "core/utils/Config";

export class SaveAction implements Action {

    public execute(): Action {
        setSAVED(true);

        return this;
    }

    public undo(): Action {
        setSAVED(false);

        return this;
    }
}
