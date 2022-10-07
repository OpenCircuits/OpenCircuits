import {HistoryManager} from "core/actions/HistoryManager";

import {SplitWire} from "core/actions/compositions/SplitWire";

import {Connect}    from "core/actions/units/Connect";
import {PlaceGroup} from "core/actions/units/Place";

import {Bus}             from "digital/actions/compositions/Bus";
import {SetMuxPortCount} from "digital/actions/compositions/SetMuxPortCount";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";

import {LED} from "digital/models/ioobjects/outputs/LED";


describe("Integration Tests for Actions", () => {
    test("Bus 5 switches to 3s Mux", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new HistoryManager();

        const a = new Switch();
        const b = new Switch();
        const c = new Switch();
        const d = new Switch();
        const e = new Switch();

        const m = new Multiplexer();


        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);

        manager.add(PlaceGroup(designer, [a,b,c,d,e,m]))

                .add(SetMuxPortCount(m, 3))

                .add(Bus([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                         [m,m,m,m,m].map((m,i) => m.getInputPort(i))))

                .undo().undo().undo()
                .redo().redo().redo()
                .undo().undo().undo();

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);
    });
    test("Bus 5 switches to 3s Mux then change to 2s Mux", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new HistoryManager();

        const a = new Switch();
        const b = new Switch();
        const c = new Switch();
        const d = new Switch();
        const e = new Switch();

        const m = new Multiplexer();


        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);

        manager.add(PlaceGroup(designer, [a,b,c,d,e,m]))

                .add(SetMuxPortCount(m, 3))

                .add(Bus([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                         [m,m,m,m,m].map((m,i) => m.getInputPort(i))))

                .add(SetMuxPortCount(m, 2))

                .undo().undo().undo().undo()
                .redo().redo().redo().redo()
                .undo().undo().undo().undo();

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);
    });
    test("Connect Switch -> LED, Split Wire, then Undo everything", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new HistoryManager();

        const a = new Switch();
        const b = new LED();
        const n = new DigitalNode();

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);

        manager.add(PlaceGroup(designer, [a,b]))

                .add(Connect(designer, a.getOutputPort(0), b.getInputPort(0)))

                .add(SplitWire(designer, a.getOutputs()[0], n))

                .undo().undo().undo()
                .redo().redo().redo()
                .undo().undo().undo();

        expect(designer.getObjects()).toHaveLength(0);
        expect(designer.getWires()).toHaveLength(0);
    });
});
