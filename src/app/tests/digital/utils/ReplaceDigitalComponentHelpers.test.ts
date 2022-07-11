import {GetHelpers} from "test/helpers/Helpers";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {CanReplace} from "digital/utils/ReplaceDigitalComponentHelpers";

import {DigitalCircuitDesigner} from "digital/models";

import {DigitalObjectSet}                                    from "digital/models/DigitalObjectSet";
import {ANDGate, Demultiplexer, ICData, LED, ORGate, Switch} from "digital/models/ioobjects";



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
        const [a, b, c, d, e, f, g, h, i, demux, out] = Place(new Switch(), new Switch(), new Switch(),
                                                              new Switch(), new Switch(), new Switch(),
                                                              new Switch(), new Switch(), new Switch(),
                                                              new Demultiplexer(), new LED());
        Connect(a, 0, demux, 0);
        Connect(demux, 0, out, 0);
        let selectPorts = demux.getSelectPorts();
        new ConnectionAction(designer, b.getOutputPort(0), selectPorts[0]).execute();
        new ConnectionAction(designer, c.getOutputPort(0), selectPorts[1]).execute();

        expect(CanReplace(demux, "ORGate")).toBeTruthy();

        demux.setSelectPortCount(8);
        selectPorts = demux.getSelectPorts();
        new ConnectionAction(designer, d.getOutputPort(0), selectPorts[2]).execute();
        new ConnectionAction(designer, e.getOutputPort(0), selectPorts[3]).execute();
        new ConnectionAction(designer, f.getOutputPort(0), selectPorts[4]).execute();
        new ConnectionAction(designer, g.getOutputPort(0), selectPorts[5]).execute();
        new ConnectionAction(designer, h.getOutputPort(0), selectPorts[6]).execute();
        new ConnectionAction(designer, i.getOutputPort(0), selectPorts[7]).execute();

        expect(CanReplace(demux, "ORGate")).toBeFalsy();

        demux.setSelectPortCount(7);
        expect(CanReplace(demux, "ORGate")).toBeTruthy();

        const [out2] = Place(new LED());
        Connect(demux, 1, out2, 0);
        expect(CanReplace(demux, "ORGate")).toBeFalsy();
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

    test("ORGate -> Demultiplexer", () => {
        const or = new ORGate();
        or.setInputPortCount(3);
        const [obj] = AutoPlace(or);

        expect(CanReplace(obj, "Demultiplexer")).toBeTruthy();
    });
});