import {Action} from "core/actions/Action";

export class GroupAction implements Action {
    private actions: Action[];
    private customName?: string;
    private customInfo?: string[];

    public constructor(actions?: Action[], customName?: string, customInfo?: string[]) {
        this.actions = actions || [];
        this.customName = customName;
        this.customInfo = (customInfo == undefined) ? undefined : customInfo;
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

    public getCustomInfo(): string[] {
        if (this.customInfo)
            return this.customInfo;
        return [`Applied to ${this.actions.length} things.`]
    }

    public getActions(): Action[] {
        return this.actions;
    }
}
