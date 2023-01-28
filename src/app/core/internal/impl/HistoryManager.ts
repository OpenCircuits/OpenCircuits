import {CircuitOp, InvertMultiOp, MultiOp} from "./CircuitOps";


class MultiOpStack {
    private stack: MultiOp[];

    public push(op: CircuitOp | MultiOp): void {
        if (op.kind === "MultiOp")
            this.stack.push(op);
        else
            this.stack.push({ kind: "MultiOp", ops: [op] });
    }
    public pop(): MultiOp | undefined {
        return this.stack.pop();
    }

    public clear(): void {
        this.stack = [];
    }

    public get length(): number {
        return this.stack.length;
    }
}

export class HistoryManager {

    private readonly undoStack: MultiOpStack;
    private readonly redoStack: MultiOpStack;

    public constructor() {
        this.undoStack = new MultiOpStack();
        this.redoStack = new MultiOpStack();
    }

    public push(op: CircuitOp | MultiOp): void {
        if (this.redoStack.length > 0)
            this.redoStack.clear();
        this.undoStack.push(op);
    }

    // Returns a MultiOp that undoes the most recent MultiOp
    public undo(): MultiOp | undefined {
        const op = this.undoStack.pop();
        if (!op)
            return undefined;
        this.redoStack.push(op);
        return InvertMultiOp(op);
    }

    // Returns a MultiOp that re-does the most recently undone MultiOp
    public redo(): MultiOp | undefined {
        const op = this.redoStack.pop();
        if (!op)
            return undefined;
        this.undoStack.push(op);
        return op;
    }

}
