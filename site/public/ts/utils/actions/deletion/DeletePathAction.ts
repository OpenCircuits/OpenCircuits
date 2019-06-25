import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {DeleteAction} from "./DeleteAction";
import {DeleteWireAction} from "./DeleteWireAction";

import {Wire} from "../../../models/ioobjects/Wire";
import {WirePort} from "../../../models/ioobjects/other/WirePort";

export class DeletePathAction implements Action {
    private action: GroupAction;

    public constructor(path: Array<Wire | WirePort>) {
        this.action = new GroupAction();

        // Remove wires first
        path.filter((p) => p instanceof Wire)
            .map((p) => p as Wire)
            .forEach((w) => this.action.add(new DeleteWireAction(w)));

        // Then remove WirePorts
        path.filter((p) => p instanceof WirePort)
            .map((p) => p as WirePort)
            .forEach((wp) => this.action.add(new DeleteAction(wp)));
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
