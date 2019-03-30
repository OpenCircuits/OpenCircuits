import {Action} from "./Action";

export class GroupAction implements Action {
    private actions: Array<Action>;

    public constructor() {
        this.actions = [];
    }

    public add(action: Action): void {
        // Add to front
        this.actions.unshift(action);
    }

    public execute(): void {
        for (const action of this.actions)
            action.execute();
    }

    public undo(): void {
        for (const action of this.actions)
            action.undo();
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
