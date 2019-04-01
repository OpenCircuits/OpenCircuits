import {Action} from "./Action";

export class GroupAction implements Action {
    private actions: Array<Action>;

    public constructor() {
        this.actions = [];
    }

    public add(action: Action): void {
        // Add to front
        this.actions.push(action);
    }

    public execute(): void {
        for (let i = 0; i < this.actions.length; i++)
            this.actions[i].execute();
    }

    public undo(): void {
        for (let i = this.actions.length-1; i >= 0; i--)
            this.actions[i].undo();
    }

    public isEmpty(): boolean {
        for (const action of this.actions) {
            // Ignore other empty GroupActions
            if (action instanceof GroupAction && action.isEmpty())
                continue;
            return false;
        }
        return true;
    }

}
