import {Z_KEY, Y_KEY} from "../Constants";
import {Tool} from "./Tool";
import {Input} from "../Input";

import {ActionManager} from "../actions/ActionManager";

export class ActionHelper {
    private disabled: boolean;
    private actionManager : ActionManager;

    public constructor(actionManager: ActionManager) {
        this.disabled = false;
        this.actionManager = actionManager;
    }

    public onEvent(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (this.disabled)
            return false;

        if (event == "keydown" && input.isModifierKeyDown()) {
            if (button === Z_KEY) {
                this.actionManager.undo()
                return true; // True to re-render
            }
            if (button === Y_KEY) {
                this.actionManager.redo()
                return true; // True to re-render
            }
        }
        return false;
    }

    public disable() {
        this.disabled = true;
    }
}
