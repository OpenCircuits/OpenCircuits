import {v4 as uuid} from "uuid";

import {Action} from "core/actions/Action";

import {AnyObj, AnyWire} from "core/models/types";

import {CreateComponent} from "core/models/utils/CreateComponent";
import {CreateWire}      from "core/models/utils/CreateWire";

import {CircuitController} from "core/controllers/CircuitController";

import {GroupAction} from "../GroupAction";

import {Delete, Place, PlaceGroup} from "./Place";


class SplitWireAction implements Action {
    private readonly wire: AnyWire;

    private readonly action: GroupAction;

    public constructor(circuit: CircuitController<AnyObj>, wire: AnyWire, zIndex: number, nodeID = uuid()) {
        this.wire = wire;

        const [node, ...ports] = CreateComponent(circuit.getNodeKind(), zIndex, nodeID);

        const newWire1 = CreateWire(circuit.getWireKind(), wire.p1, ports[0].id);
        const newWire2 = CreateWire(circuit.getWireKind(), ports[1].id, wire.p2);

        newWire1.color = wire.color;
        newWire2.color = wire.color;

        this.action = new GroupAction([
            Delete(circuit, wire),
            PlaceGroup(circuit, [node, ...ports]),
            Place(circuit, newWire1),
            Place(circuit, newWire2),
        ]);
    }

    public execute(): Action {
        this.action.execute();

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }

    public getName(): string {
        return `Split Wire (${this.wire.name})`;
    }
    public getCustomInfo(): string[] | undefined {
        return [this.wire.id];
    }
}

export function Split(circuit: CircuitController<AnyObj>, wire: AnyWire, zIndex: number, nodeID = uuid()) {
    return new SplitWireAction(circuit, wire, zIndex, nodeID);
}
