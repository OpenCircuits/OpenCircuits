import {Action} from "./Action";
import {ReversableAction} from "./ReversableAction";

import {IOObject} from "../../models/ioobjects/IOObject";
import {Port} from "../../models/ports/Port";

import {SelectionTool} from "../tools/SelectionTool";

export class SelectAction extends ReversableAction {
    private selectionTool: SelectionTool;
    private obj: IOObject | Port;

    public constructor(selectionTool: SelectionTool, obj: IOObject | Port, flip: boolean = false) {
        super(flip);

        this.selectionTool = selectionTool;
        this.obj = obj;
    }

    protected normalExecute(): Action {
        this.selectionTool.addSelection(this.obj);

        return this;
    }

    protected normalUndo(): Action {
        this.selectionTool.removeSelection(this.obj);

        return this;
    }

}

export class DeselectAction extends SelectAction {
    public constructor(selectionTool: SelectionTool, obj: IOObject | Port) {
        super(selectionTool, obj, true);
    }
}
