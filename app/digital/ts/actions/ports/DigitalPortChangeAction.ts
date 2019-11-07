import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";
import {CreateDeletePathAction} from "core/actions/deletion/DeletePathActionFactory";

import {GetPath} from "core/utils/ComponentUtils";

import {Port} from "core/models/ports/Port";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";

export class DigitalPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    public constructor(obj: DigitalComponent, target: number, initialCount: number) {
        super(obj, target, initialCount);
    }

    protected createAction(ports: Port[], target: number): GroupAction {
        const group = new GroupAction();

        // Disconnect all the wires coming out from
        //  each port that will be removed
        while (ports.length > target) {
            const wires = ports.pop().getWires();
            group.add(wires.map(w => CreateDeletePathAction(GetPath(w as DigitalWire))));
        }

        return group;
    }

}
