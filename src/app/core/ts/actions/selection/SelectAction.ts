import {Action} from "core/actions/Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {Selectable} from "core/utils/Selectable";

import {SelectionTool} from "core/tools/SelectionTool";

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


export function CreateGroupSelectAction(selectionTool: SelectionTool, objs: Array<Selectable>): GroupAction {
    return objs.reduce((acc, s) => {
        return acc.add(new SelectAction(selectionTool, s));
    }, new GroupAction());
}

export function CreateDeselectAllAction(selectionTool: SelectionTool): GroupAction {
    const objs = selectionTool.getSelections();
    return objs.reduce((acc, s) => {
        return acc.add(new DeselectAction(selectionTool, s));
    }, new GroupAction());
}
