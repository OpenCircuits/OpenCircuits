import {Action} from "core/actions/Action";


export type HistoryCallbackType = "add" | "undo" | "redo" | "reset";
export type HistoryCallback = (type: HistoryCallbackType, action?: Action) => void;

/**
 * Manages undo/redo actions.
 */
export class HistoryManager {
    private undoStack: Action[];
    private redoStack: Action[];

    private disabled: boolean;

    private readonly callbacks: Set<HistoryCallback>;

    public constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.disabled = false;
        this.callbacks = new Set();
    }

    private callback(type: HistoryCallbackType, action?: Action): void {
        this.callbacks.forEach((c) => c(type, action));
    }

    public addCallback(callback: HistoryCallback): void {
        this.callbacks.add(callback);
    }

    public removeCallback(callback: HistoryCallback): void {
        this.callbacks.delete(callback);
    }

    public setDisabled(disabled = true): void {
        this.disabled = disabled;
    }

    /**
     * Add a new action to the undo stack.
     *
     * @param action The new action.
     * @returns        This HistoryManager for method chaining.
     */
    public add(action: Action): HistoryManager {
        if (this.disabled)
            return this;

        this.redoStack = [];
        this.undoStack.push(action);

        this.callback("add", action);

        return this;
    }

    /**
     * Undo next action and add to redo stack.
     *
     * @returns This HistoryManager for method chaining.
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

            this.callback("undo", action);
        }

        return this;
    }

    /**
     * Redo next action and add back to undo stack.
     *
     * @returns This HistoryManager for method chaining.
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

            this.callback("redo", action);
        }

        return this;
    }

    public reset(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.callback("reset");
    }

    public getActions(): Action[] {
        return [...this.undoStack];
    }

    public getRedoActions(): Action[] {
        return [...this.redoStack];
    }
}
