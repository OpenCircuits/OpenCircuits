import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalWire} from "digital/models/DigitalWire";
import {Action} from "core/actions/Action";
import {LED, Switch} from "digital/models/ioobjects";
import {GroupAction} from "core/actions/GroupAction";
import {Wire} from "core/models";


export function GetHelpers(designer: DigitalCircuitDesigner) {
    return {
        Place: <T extends DigitalComponent[]>(...objs: T) => {
            return [...objs, CreateGroupPlaceAction(designer, objs).execute()] as [...T, Action];
        },
        Connect: (c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number) => {
            return new ConnectionAction(designer, c1.getOutputPort(i1), c2.getInputPort(i2)).execute() as ConnectionAction;
        },
        // Given a DigitalComponent
        // Creates Switches for each input and LEDs for each output
        // Connects them together, and returns them
        AutoPlace: <T extends DigitalComponent>(obj: T) => {
            // Create switches/leds
            const switches = new Array(obj.numInputs()).fill(0).map(_ => new Switch());
            const leds = new Array(obj.numOutputs()).fill(0).map(_ => new LED());

            const group = new GroupAction();
            group.add(CreateGroupPlaceAction(designer, [obj, ...switches, ...leds]));

            // Create connections
            let wires = [] as Wire[];
            switches.forEach((s, i) => {
                const action = new ConnectionAction(designer, s.getOutputPort(0), obj.getInputPort(i));
                group.add(action);
                wires.push(action.getWire());
            });
            leds.forEach((l, i) => {
                const action = new ConnectionAction(designer, obj.getOutputPort(i), l.getInputPort(0));
                group.add(action);
                wires.push(action.getWire());
            });

            return [obj, switches, leds, wires, group.execute()] as [T, Switch[], LED[], Wire[], Action];
        },
        Remove: (...objs: (DigitalComponent | DigitalWire)[]) => {
            return CreateDeleteGroupAction(designer, objs).execute();
        }
    };
}
