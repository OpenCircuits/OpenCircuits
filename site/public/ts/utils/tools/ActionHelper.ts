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

    public onEvent(currentTool: Tool, event: string, input: Input, key?: number): boolean {
        if (this.disabled)
            return false;
        if (event != "keydown")
            return false;

        // Redo: CMD/CTRL + SHIFT + Z   or   CMD/CTRL + Y
        if (input.isModifierKeyDown() && input.isShiftKeyDown() && key == Z_KEY ||
            input.isModifierKeyDown() &&                           key == Y_KEY) {
            this.actionManager.redo();
            return true;
        }

        // Undo: CMD/CTRL + Z
        if (input.isModifierKeyDown() && key == Z_KEY) {
            this.actionManager.undo();
            return true;
        }

        return false;
    }

    public setDisabled(val: boolean = true) {
        this.disabled = val;
    }
}
