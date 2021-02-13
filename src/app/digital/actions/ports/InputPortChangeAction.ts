import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models/ports/Port";

import {DigitalComponent} from "digital/models/DigitalComponent";


export class InputPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    public constructor(obj: DigitalComponent, initial: number, target: number) {
        super(obj.getDesigner(), target, initial);
        this.obj = obj;
    }

    protected getPorts(): Port[] {
        return this.obj.getInputPorts();
    }

    public execute(): Action {
        super.execute();
        this.obj.setInputPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setInputPortCount(this.initialCount);
        super.undo();
        return this;
    }

}
