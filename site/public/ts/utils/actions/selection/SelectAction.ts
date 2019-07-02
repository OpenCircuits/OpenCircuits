import {Action} from "../Action";
import {ReversableAction} from "../ReversableAction";

import {Selectable} from "../../Selectable";

import {SelectionTool} from "../../tools/SelectionTool";

export class SelectAction extends ReversableAction {
    private selectionTool: SelectionTool;
    private obj: Selectable;

    public constructor(selectionTool: SelectionTool, obj: Selectable, flip: boolean = false) {
        super(flip);

        this.selectionTool = selectionTool;
        this.obj = obj;
    }

    protected normalExecute(): Action {
        this.selectionTool.select(this.obj);

        return this;
    }

    protected normalUndo(): Action {
        this.selectionTool.deselect(this.obj);

        return this;
    }

}

export class DeselectAction extends SelectAction {
    public constructor(selectionTool: SelectionTool, obj: Selectable) {
        super(selectionTool, obj, true);
    }
}
