import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";


export function GetHelpers({designer}: Partial<DigitalCircuitInfo>) {
    return {
        Place: (...objs: DigitalComponent[]) => {
            return CreateGroupPlaceAction(designer, objs).execute();
        },
        Connect: (c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number) => {
            return new ConnectionAction(designer, c1.getOutputPort(i1), c2.getInputPort(i2)).execute() as ConnectionAction;
        },
        Remove: (...objs: (DigitalComponent | DigitalWire)[]) => {
            return CreateDeleteGroupAction(designer, objs).execute();
        }
    };
}
