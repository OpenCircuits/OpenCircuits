import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";
import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {SelectPortChangeAction} from "digital/actions/ports/SelectPortChangeAction";

import {Place, Connect} from "test/helpers/Helpers";

describe("Select Port Change Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const mux = new Multiplexer();

        Place(designer, [mux]);

        // before connection
        expect(mux.getSelectPortCount().getValue()).toBe(2);
        expect(mux.getInputPortCount().getValue()).toBe(4);
        expect(mux.getOutputPortCount().getValue()).toBe(1);

        // change select port count
        const a1 = new SelectPortChangeAction(mux, 4).execute();

        // initial
        expect(mux.getSelectPortCount().getValue()).toBe(4);
        expect(mux.getInputPortCount().getValue()).toBe(16);
        expect(mux.getOutputPortCount().getValue()).toBe(1);

        // reverted
        a1.undo();
        expect(mux.getSelectPortCount().getValue()).toBe(2);
        expect(mux.getInputPortCount().getValue()).toBe(4);
        expect(mux.getOutputPortCount().getValue()).toBe(1);

        // back to initial
        a1.execute();
        expect(mux.getSelectPortCount().getValue()).toBe(4);
        expect(mux.getInputPortCount().getValue()).toBe(16);
        expect(mux.getOutputPortCount().getValue()).toBe(1);
    });
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const sw = new Switch();
        const n = new DigitalNode();
        const mux = new Multiplexer();

        Place(designer, [mux, sw, n]);

        // Connect switch to node and then then to input and select ports of Mux
        Connect(sw, 0, n, 0);
        Connect(n, 0, mux, 3);
        new ConnectionAction(n.getOutputPorts()[0], mux.getSelectPorts()[1]).execute();

        expect(designer.getObjects()).toHaveLength(3);
        expect(designer.getWires()).toHaveLength(3);

        // change select port count
        const a1 = new SelectPortChangeAction(mux, 1).execute();

        // initial
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(0);

        // reverted
        a1.undo();
        expect(designer.getObjects()).toHaveLength(3);
        expect(designer.getWires()).toHaveLength(3);

        // back to initial
        a1.execute();
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(0);
    });
});
