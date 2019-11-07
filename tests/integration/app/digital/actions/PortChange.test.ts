import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";
import {SelectPortChangeAction} from "digital/actions/ports/SelectPortChangeAction";
import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

import {Place, Connect} from "test/helpers/Helpers";

describe("Select Port Change Action", () => {
    test("Undo/Redo 1", () => {
        //
        //                        |------- Mux
        //  Switch ----- Node ----|         |
        //                        |---------|
        //
        const designer = new DigitalCircuitDesigner(0);
        const sw = new Switch();
        const node = new DigitalNode();
        const mux = new Multiplexer();

        // set to higher port count first
        new SelectPortChangeAction(mux, 3).execute();

        Place(designer, [mux, sw, node]);


        // connect node to two parts of the mux
        Connect(sw, 0, node, 0);
        Connect(node, 0, mux, 7)
        new ConnectionAction(node.getOutputPort(0), mux.getSelectPorts()[2]).execute();

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
});
