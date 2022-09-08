import {Selectable} from "core/utils/Selectable";

import {Action} from "core/actions/Action";


class SetNameAction implements Action {
    private readonly obj: Selectable;
    private readonly newName: string;
    private readonly oldName: string;

    public constructor(o: Selectable, newName: string) {
        this.obj = o;
        this.newName = newName;
        this.oldName = o.getName();

        this.execute();
    }

    public execute(): Action {
        this.obj.setName(this.newName);
        return this;
    }

    public undo(): Action {
        this.obj.setName(this.oldName);
        return this;
    }

    public getName(): string {
        return "Set Name";
    }
}

export function SetName(o: Selectable, newName: string) {
    return new SetNameAction(o, newName);
}
