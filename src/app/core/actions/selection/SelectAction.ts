import {Action} from "core/actions/Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {Selectable} from "core/utils/Selectable";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";


export class SelectAction extends ReversableAction {
    private selections: SelectionsWrapper;
    private obj: Selectable;

    public constructor(selections: SelectionsWrapper, obj: Selectable, flip: boolean = false) {
        super(flip);

        this.selections = selections;
        this.obj = obj;
    }

    protected normalExecute(): Action {
        this.selections.select(this.obj);

        return this;
    }

    protected normalUndo(): Action {
        this.selections.deselect(this.obj);

        return this;
    }

}

export class DeselectAction extends SelectAction {
    public constructor(selections: SelectionsWrapper, obj: Selectable) {
        super(selections, obj, true);
    }
}


export function CreateGroupSelectAction(selections: SelectionsWrapper, objs: Selectable[]): GroupAction {
    return objs.reduce((acc, s) => {
        return acc.add(new SelectAction(selections, s));
    }, new GroupAction());
}

export function CreateDeselectAllAction(selections: SelectionsWrapper): GroupAction {
    const objs = selections.get();
    return objs.reduce((acc, s) => {
        return acc.add(new DeselectAction(selections, s));
    }, new GroupAction());
}
