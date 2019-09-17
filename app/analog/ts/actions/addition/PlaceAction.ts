import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {ReversableAction} from "../ReversableAction";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {EEComponent} from "analog/models/eeobjects/EEComponent";

export class PlaceAction extends ReversableAction {
    private designer: EECircuitDesigner;
    private obj: EEComponent;

    public constructor(designer: EECircuitDesigner, obj: EEComponent, flip: boolean = false) {
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
    public constructor(obj: EEComponent) {
        super(obj.getDesigner(), obj, true);
    }
}


export function CreateGroupPlaceAction(designer: EECircuitDesigner, objs: Array<EEComponent>): GroupAction {
    return objs.reduce((acc, o) => {
        return acc.add(new PlaceAction(designer, o)) as GroupAction;
    }, new GroupAction());
}
