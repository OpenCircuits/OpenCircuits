import {Action} from "./Action";
import {setSAVED} from "../Config";

export class SaveAction implements Action {

    public execute(): void {
        setSAVED(true)
    }

    public undo(): void {
        setSAVED(false)
    }
}
