import "jest";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models";
import {ANDGate, Demultiplexer, LED, Switch} from "digital/models/ioobjects";
import {CanReplace} from "digital/utils/ReplaceDigitalComponentHelpers";

import {GetHelpers} from "test/helpers/Helpers";


describe("CanReplace", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect, AutoPlace} = GetHelpers({designer});

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
    });
});