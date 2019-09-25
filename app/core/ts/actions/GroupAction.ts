import {Action} from "core/actions/Action";

export class GroupAction implements Action {
    private actions: Array<Action>;

    public constructor() {
        this.actions = [];
    }

    public add(action: Action | Array<Action>): GroupAction {
        if (action instanceof Array)
            this.actions = this.actions.concat(action);
        else
            this.actions.push(action);

        return this;
    }

    public execute(): Action {
        for (const action of this.actions)
            action.execute();

        return this;
    }

    public undo(): Action {
        for (let i = this.actions.length-1; i >= 0; i--)
            this.actions[i].undo();

        return this;
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
