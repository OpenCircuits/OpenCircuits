import {Action} from "core/actions/Action";

export class GroupAction implements Action {
    private actions: Action[];
    private customName?: string;
    public getCustomInfo: (action: Action) => string[];

    public constructor(actions?: Action[], customName?: string, getCustomInfo?: (action: GroupAction) => string[]) {
        this.actions = actions || [];
        this.customName = customName;
        this.getCustomInfo = (getCustomInfo == undefined) ? (action: GroupAction) => [`Applied to ${action["actions"].length} things.`] : getCustomInfo;
    }

    public add(action: Action | Action[]): GroupAction {
        if (action instanceof Array)
            this.actions = this.actions.concat(action);
        else
            this.actions.push(action);

        return this;
    }

    public execute(): GroupAction {
        for (const action of this.actions)
            action.execute();

        return this;
    }

    public undo(): GroupAction {
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

    public getName(): string {
        if (this.customName)
            return this.customName;
        // Default behavior
        if (this.actions.length === 1)
            return this.actions[0].getName();
        return `Grouped ${this.actions.length} actions` ;
    }

    public getActions(): Action[] {
        return this.actions;
    }
}
