import {CONTROL_KEY,
        Z_KEY, Y_KEY} from "../Constants";
import {Tool} from "./Tool";
import {Input} from "../Input";

import {ActionManager} from "../actions/ActionManager";

export class ActionsHelper {

    private actionManager : ActionManager;
    private ctrlKeyPressed : boolean;

    public constructor(actionManager: ActionManager) {
        this.ctrlKeyPressed = false;
        this.actionManager = actionManager;
    }

    public onEvent(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (button === CONTROL_KEY)
            if (event == "keydown")
                this.ctrlKeyPressed = true;
            else if (event == "keyup")
                this.ctrlKeyPressed = false;

        if (event == "keydown" && this.ctrlKeyPressed) {
            if (button === Z_KEY)
              this.actionManager.undo()
            if (button === Y_KEY)
              this.actionManager.redo()
        }

        return true; // True to re-render
    }
}
