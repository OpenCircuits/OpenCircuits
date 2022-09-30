import {GUID}              from "core/utils/GUID";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {Action} from "core/actions/Action";

import {GroupAction}      from "../GroupAction";
import {ReversableAction} from "../ReversableAction";


class SelectAction extends ReversableAction {
    private readonly selections: SelectionsWrapper;
    private readonly obj: GUID;

    public constructor(selections: SelectionsWrapper, obj: GUID, flip = false) {
        super(flip);

        this.selections = selections;
        this.obj = obj;

        this.execute();
    }

    protected normalExecute(): Action {
        this.selections.select(this.obj);

        return this;
    }

    protected normalUndo(): Action {
        this.selections.deselect(this.obj);

        return this;
    }

    public getName(): string {
        return `Selected ${this.obj}`;
    }

}

export function Select(selections: SelectionsWrapper, obj: GUID) {
    return new SelectAction(selections, obj);
}
export function Deselect(selections: SelectionsWrapper, obj: GUID) {
    return new SelectAction(selections, obj, true);
}


export function SelectGroup(selections: SelectionsWrapper, objs: GUID[]): GroupAction {
    return new GroupAction(
        objs.map((o) => Select(selections, o)),
        "Select Group",
    );
}

export function DeselectAll(selections: SelectionsWrapper): GroupAction {
    const objs = selections.get();
    return new GroupAction(
        objs.map((o) => Deselect(selections, o)),
        "Deselect All",
    );
}
