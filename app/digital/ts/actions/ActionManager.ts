import {Action} from "./Action";
import {SaveAction} from "./SaveAction";
import {setSAVED} from "core/utils/Config";

/**
 * Manages undo/redo actions
 */
export class ActionManager {
    private undoStack: Array<Action>;
    private redoStack: Array<Action>;

    public constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Add a new action to the undo stack
     * @param action The new action
     */
    public add(action: Action): ActionManager {
        this.redoStack = [];
        this.undoStack.push(action);
        if (!(action instanceof SaveAction))
            setSAVED(false);

        return this;
    }

    /**
     * Undo next action and add to redo stack
     */
    public undo(): ActionManager {
        if (this.undoStack.length > 0) {
            // pop next action and undo it
            const action = this.undoStack.pop();
            action.undo();

            // add to redo stack
            this.redoStack.push(action);
            // SaveActions cannot be undone on their own
            if (action instanceof SaveAction)
                this.undo();
        }
        if (this.undoStack.length == 0)
            setSAVED(true);

        return this;
    }

    /**
     * Redo next action and add back to undo stack
     */
    public redo(): ActionManager {
        if (this.redoStack.length > 0) {
            // pop next action and redo it
            const action = this.redoStack.pop();
            action.execute();

            // add back to undo stack
            this.undoStack.push(action);

            if (action instanceof SaveAction) {
                while (this.redoStack.length > 0 && (this.redoStack[this.redoStack.length - 1] instanceof SaveAction))
                    this.redoStack.pop();
            } else if (this.redoStack.length > 0 && (this.redoStack[this.redoStack.length - 1] instanceof SaveAction))
                this.redo();
        }

        return this;
    }

}
