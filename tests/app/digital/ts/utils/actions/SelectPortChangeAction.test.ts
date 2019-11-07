import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {Place} from "../../Helpers";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";
import {SelectPortChangeAction} from "digital/actions/ports/SelectPortChangeAction";

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
});
