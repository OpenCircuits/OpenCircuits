import {GetHelpers} from "test/helpers/Helpers";

import {Connect as CreateConnection} from "core/actions/units/Connect";

import {SetMuxPortCount} from "digital/actions/compositions/SetMuxPortCount";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";


describe("Select Port Change Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place } = GetHelpers(designer);

        const [mux] = Place(new Multiplexer());

        // before connection
        expect(mux.getSelectPortCount().getValue()).toBe(2);
        expect(mux.getInputPortCount().getValue()).toBe(4);
        expect(mux.getOutputPortCount().getValue()).toBe(1);

        // change select port count
        const a1 = SetMuxPortCount(mux, 4);

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
    test("Undo/Redo 2", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [sw, n, mux] = Place(new Switch(), new DigitalNode(), new Multiplexer());

        // Connect switch to node and then then to input and select ports of Mux
        Connect(sw, n);
        Connect(n, 0, mux, 3);
        CreateConnection(designer, n.getOutputPorts()[0], mux.getSelectPorts()[1]);

        expect(designer.getObjects()).toHaveLength(3);
        expect(designer.getWires()).toHaveLength(3);

        // change select port count
        const a1 = SetMuxPortCount(mux, 1);

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
