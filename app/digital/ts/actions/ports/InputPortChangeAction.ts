import {Action} from "core/actions/Action";

import {Port} from "core/models/ports/Port";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";

import {Decoder} from "digital/models/ioobjects/other/Decoder";

export class InputPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    protected outputAction: OutputPortChangeAction;

    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getInputPorts().length);
        if (obj instanceof Decoder)
            this.outputAction = new OutputPortChangeAction(obj, Math.pow(2, target));
    }

    protected getPorts(): Port[] {
        return this.obj.getInputPorts();
    }

    public execute(): Action {
        super.execute();
        if (this.outputAction != null)
            this.outputAction.execute();
        this.obj.setInputPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setInputPortCount(this.initialCount);
        if (this.outputAction != null)
            this.outputAction.undo();
        super.undo();
        return this;
    }

}
