import {Selectable} from "core/utils/Selectable";
import {Action} from "core/actions/Action";


export class SetNameAction implements Action {
    private obj: Selectable;
    private newName: string;
    private oldName: string;

    public constructor(o: Selectable, newName: string) {
        this.obj = o;
        this.newName = newName;
        this.oldName = o.getName();
    }

    public execute(): Action {
        this.obj.setName(this.newName);
        return this;
    }

    public undo(): Action {
        this.obj.setName(this.oldName);
        return this;
    }

}
