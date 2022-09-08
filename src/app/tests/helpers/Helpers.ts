import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {Connect as CreateConnection} from "core/actions/units/Connect";
import {PlaceGroup}                  from "core/actions/units/Place";


import {Wire} from "core/models";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent}       from "digital/models/DigitalComponent";
import {DigitalWire}            from "digital/models/DigitalWire";
import {LED, Switch}            from "digital/models/ioobjects";


type ConnectionAction = ReturnType<typeof CreateConnection>;

export function GetHelpers(designer: DigitalCircuitDesigner) {
    function Place<T extends DigitalComponent[]>(...objs: T) {
        return [...objs, PlaceGroup(designer, objs)] as [...T, Action];
    }

    // type ObjConnectInfo = { c: DigitalComponent, i?: number };
    // function Connect(c1: ObjConnectInfo, c2: ObjConnectInfo): ConnectionAction[] {
    //     if (c1.i && c2.i) {
    //         return [new ConnectionAction(designer, c1.c.getOutputPort(c1.i),
    //                                      c2.c.getInputPort(c2.i)) as ConnectionAction];
    //     }
    // }
    function Connect(c1: DigitalComponent, c2: DigitalComponent): ConnectionAction[];
    function Connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): ConnectionAction;
    function Connect(...args: [DigitalComponent, DigitalComponent] |
                              [DigitalComponent, number, DigitalComponent, number]) {
        switch (args.length) {
            case 2: {
                const [c1, c2] = args;
                // Connect each port
                const outs = c1.getOutputPorts();
                const ins = c2.getInputPorts().filter((i) => i.getWires().length === 0);

                return new Array(Math.min(outs.length, ins.length))
                    .fill(0)
                    .map((_, i) => CreateConnection(designer, outs[i], ins[i]));
            }
            case 4: {
                const [c1, i1, c2, i2] = args;
                return CreateConnection(designer, c1.getOutputPort(i1), c2.getInputPort(i2));
            }
        }
    }


    return {
        Place,
        Connect,
        // Given a DigitalComponent
        // Creates Switches for each input and LEDs for each output
        // Connects them together, and returns them
        AutoPlace: <T extends DigitalComponent>(obj: T) => {
            // Create switches/leds
            const switches = new Array(obj.numInputs()).fill(0).map((_) => new Switch());
            const leds = new Array(obj.numOutputs()).fill(0).map((_) => new LED());

            const group = new GroupAction();
            group.add(PlaceGroup(designer, [obj, ...switches, ...leds]));

            // Create connections
            const wires = [] as Wire[];
            switches.forEach((s, i) => {
                const action = CreateConnection(designer, s.getOutputPort(0), obj.getInputPort(i));
                group.add(action);
                wires.push(action.getWire());
            });
            leds.forEach((l, i) => {
                const action = CreateConnection(designer, obj.getOutputPort(i), l.getInputPort(0));
                group.add(action);
                wires.push(action.getWire());
            });

            return [obj, switches, leds, wires, group] as [T, Switch[], LED[], Wire[], Action];
        },
        Remove: (...objs: Array<DigitalComponent | DigitalWire>) => DeleteGroup(designer, objs),
    };
}
