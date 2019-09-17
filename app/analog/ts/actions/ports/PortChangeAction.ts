import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {CreateDeletePathAction} from "../deletion/DeletePathActionFactory";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {EEComponent} from "analog/models/eeobjects/EEComponent";
import {EEPort} from "analog/models/eeobjects/EEPort";
import {GetPath} from "analog/utils/ComponentUtils";

export abstract class PortChangeAction implements Action {
    protected designer: EECircuitDesigner;

    protected obj: EEComponent;

    protected targetCount: number;
    protected initialCount: number;

    protected action: Action;

    protected constructor(obj: EEComponent, target: number, initialCount: number) {
        this.designer = obj.getDesigner();

        this.obj = obj;
        this.targetCount = target;
        this.initialCount = initialCount;
    }

    protected createAction(ports: Array<EEPort>, target: number): GroupAction {
        const group = new GroupAction();

        // Disconnect all the wires coming out from
        //  each port that will be removed
        while (ports.length > target) {
            const port = ports.pop();
            port.getWires().forEach((w) =>
                group.add(CreateDeletePathAction(GetPath(w)))
            );
        }

        return group;
    }

    public execute(): Action {
        this.action.execute();

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }

}
