import {GetHelpers} from "test/helpers/Helpers";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {CanReplace} from "digital/utils/ReplaceDigitalComponentHelpers";

import {DigitalCircuitDesigner} from "digital/models";

import {DigitalObjectSet}                                  from "digital/models/DigitalObjectSet";
import {ANDGate, ICData, LED, Multiplexer, ORGate, Switch} from "digital/models/ioobjects";


describe("CanReplace", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect, AutoPlace } = GetHelpers(designer);

    test("ANDGate -> ORGate", () => {
        const [and] = AutoPlace(new ANDGate());
        expect(CanReplace(and, "ORGate")).toBeTruthy();
        const and2 = new ANDGate();
        and2.setInputPortCount(8);
        AutoPlace(and2);
        expect(CanReplace(and2, "ORGate")).toBeTruthy();
    });

    test("Demultiplexer -> ORGate", () => {
        const [a, b, c, mux, out] = Place(new Switch(), new Switch(), new Switch(),
                                            new Multiplexer(), new LED());
        Connect(a, 0, mux, 0);
        Connect(mux, 0, out, 0);

        expect(CanReplace(mux, "ORGate")).toBeTruthy();

        const selectPorts = mux.getSelectPorts();
        new ConnectionAction(designer, b.getOutputPort(0), selectPorts[0]).execute();
        new ConnectionAction(designer, c.getOutputPort(0), selectPorts[1]).execute();

        expect(CanReplace(mux, "ORGate")).toBeFalsy();

    });

    test("ORGate -> ICData", () => {
        const [obj, switches, leds, wires] = AutoPlace(new ANDGate());
        const [or] = AutoPlace(new ORGate());
        const icdata = new ICData(DigitalObjectSet.From([obj, ...switches, ...leds, ...wires]));
        expect(CanReplace(or, icdata)).toBeTruthy();
        or.setInputPortCount(3);
        const [a] = Place(new Switch());
        Connect(a, 0, or, 2);
        expect(CanReplace(or, icdata)).toBeFalsy();
    });

    test("ORGate -> Multiplexer", () => {
        const or = new ORGate();
        or.setInputPortCount(5);
        const [obj] = AutoPlace(or);

        expect(CanReplace(obj, "Multiplexer")).toBeTruthy();
    });

    test("Invalid id", () => {
        const obj = new ORGate();

        expect(() => CanReplace(obj, "This is an invalid Id")).toThrow();
    });
});
