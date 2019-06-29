import {Action} from "./Action";
import {setSAVED} from "../Config";

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
