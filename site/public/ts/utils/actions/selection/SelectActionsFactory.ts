import {GroupAction} from "../GroupAction";
import {SelectAction,
        DeselectAction} from "./SelectAction";

import {SelectionTool} from "../../tools/SelectionTool";
import {Selectable} from "../../Selectable";

export function CreateGroupSelectAction(selectionTool: SelectionTool, objs: Array<Selectable>): GroupAction {
    const action = new GroupAction();

    objs.forEach((o) => {
        action.add(new SelectAction(selectionTool, o));
    });

    return action;
}

export function CreateDeselectAllAction(selectionTool: SelectionTool): GroupAction {
    const action = new GroupAction();

    const objs = selectionTool.getSelections();
    objs.forEach((o) => {
        action.add(new DeselectAction(selectionTool, o));
    });

    return action;
}
