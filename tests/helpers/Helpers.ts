import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {GroupAction} from "core/actions/GroupAction";
import {DigitalWire} from "digital/models/DigitalWire";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

export function Place(designer: DigitalCircuitDesigner, objects: DigitalComponent[]): GroupAction {
    return CreateGroupPlaceAction(designer, objects).execute();
}

export function Connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): ConnectionAction {
    return new ConnectionAction(c1.getOutputPort(i1), c2.getInputPort(i2)).execute() as ConnectionAction;
}

export function Remove(objs: Array<DigitalComponent | DigitalWire>): GroupAction {
    return CreateDeleteGroupAction(objs).execute();
}