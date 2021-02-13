import {Action} from "core/actions/Action";

/**
 * Manages undo/redo actions
 */
export class HistoryManager {
    private undoStack: Action[];
    private redoStack: Action[];

    private disabled: boolean;

    public constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.disabled = false;
    }

    public setDisabled(disabled = true): void {
        this.disabled = disabled;
    }

    /**
     * Add a new action to the undo stack
     * @param action The new action
     */
    public add(action: Action): HistoryManager {
        if (this.disabled)
            return this;

        this.redoStack = [];
        this.undoStack.push(action);

        return this;
    }

    /**
     * Undo next action and add to redo stack
     */
    public undo(): HistoryManager {
        if (this.disabled)
            return this;

        if (this.undoStack.length > 0) {
            // pop next action and undo it
            const action = this.undoStack.pop()!;
            action.undo();

            // add to redo stack
            this.redoStack.push(action);
        }

        return this;
    }

    /**
     * Redo next action and add back to undo stack
     */
    public redo(): HistoryManager {
        if (this.disabled)
            return this;

        if (this.redoStack.length > 0) {
            // pop next action and redo it
            const action = this.redoStack.pop()!;
            action.execute();

            // add back to undo stack
            this.undoStack.push(action);
        }

        return this;
    }

    public reset(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

}
