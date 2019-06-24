import {Action} from "./Action";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Port} from "../../models/ports/Port";

import {SelectionTool} from "../tools/SelectionTool";

export class SelectAction implements Action {
    private selectionTool: SelectionTool;
    private obj: IOObject | Port;

    // True if we should deselect while executing and select while undoing
    private flip: boolean;

    public constructor(selectionTool: SelectionTool, obj: IOObject | Port, flip: boolean = false) {
        this.selectionTool = selectionTool;
        this.obj = obj;
        this.flip = flip;
    }

    public execute(): Action {
        if (this.flip)
            this.selectionTool.removeSelection(this.obj);
        else
            this.selectionTool.addSelection(this.obj);

        return this;
    }

    public undo(): Action {
        if (this.flip)
            this.selectionTool.addSelection(this.obj);
        else
            this.selectionTool.removeSelection(this.obj);

        return this;
    }

}
