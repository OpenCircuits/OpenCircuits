import {Action} from "core/actions/Action";

/**
 * Describes an action that is reversable for code-reuse.
 *  Ex. A Place action and Delete action would be identical except
 *  their execute's and undo's would be opposite of eacother.
 *  This reconciles that reuse of code and allows for a single class.
 */
export abstract class ReversableAction implements Action {
    private readonly flipped: boolean;

    protected constructor(flip: boolean) {
        this.flipped = flip;
    }

    protected abstract normalExecute(): Action;
    protected abstract normalUndo(): Action;

    public execute(): Action {
        return (this.flipped) ? (this.normalUndo()) : (this.normalExecute());
    }

    public undo(): Action {
        return (this.flipped) ? (this.normalExecute()) : (this.normalUndo());
    }

    public abstract getName(): string;
}
