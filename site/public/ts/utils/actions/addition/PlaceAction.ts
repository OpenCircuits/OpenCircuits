import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {CircuitDesigner} from "../../../models/CircuitDesigner";
import {Component} from "../../../models/ioobjects/Component";

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
    public constructor(obj: Component) {
        super(obj.getDesigner(), obj, true);
    }
}


export function CreateGroupPlaceAction(designer: CircuitDesigner, objs: Array<Component>): GroupAction {
    return objs.reduce((acc, o) => {
        return acc.add(new PlaceAction(designer, o)) as GroupAction;
    }, new GroupAction());
}
