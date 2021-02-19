import {Action} from "core/actions/Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";

export class PlaceAction extends ReversableAction {
    private designer: CircuitDesigner;
    private obj: Component;

    public constructor(designer: CircuitDesigner, obj: Component, flip: boolean = false) {
        super(flip);

        this.designer = designer;
        this.obj = obj;
    }

    public normalExecute(): Action {
        this.designer.addObject(this.obj);

        return this;
    }

    public normalUndo(): Action {
        this.designer.removeObject(this.obj);

        return this;
    }

}

export class DeleteAction extends PlaceAction {
    public constructor(designer: CircuitDesigner, obj: Component) {
        super(designer, obj, true);
    }
}


export function CreateGroupPlaceAction(designer: CircuitDesigner, objs: Component[]): GroupAction {
    return new GroupAction(objs.map(o => new PlaceAction(designer, o)));
}
