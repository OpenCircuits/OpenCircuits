import "jest";

import {HistoryManager}         from "core/actions/HistoryManager";
import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {CreateSplitWireAction}  from "core/actions/addition/SplitWireAction";
import {ConnectionAction}       from "core/actions/addition/ConnectionAction";

import {CreateBusAction}     from "digital/actions/addition/BusActionFactory";
import {MuxPortChangeAction} from "digital/actions/ports/MuxPortChangeAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalNode}            from "digital/models/ioobjects/other/DigitalNode";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {LED}                    from "digital/models/ioobjects/outputs/LED";
import {Multiplexer}            from "digital/models/ioobjects/other/Multiplexer";


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


        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b,c,d,e,m]).execute())

                .add(new MuxPortChangeAction(m, m.getSelectPortCount().getValue(), 3).execute())

                .add(CreateBusAction([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                                     [m,m,m,m,m].map((m,i) => m.getInputPort(i))).execute())

                .undo().undo().undo()
                .redo().redo().redo()
                .undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
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


        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b,c,d,e,m]).execute())

                .add(new MuxPortChangeAction(m, m.getSelectPortCount().getValue(), 3).execute())

                .add(CreateBusAction([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                                     [m,m,m,m,m].map((m,i) => m.getInputPort(i))).execute())

                .add(new MuxPortChangeAction(m, m.getSelectPortCount().getValue(), 2).execute())

                .undo().undo().undo().undo()
                .redo().redo().redo().redo()
                .undo().undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
    test("Connect Switch -> LED, Split Wire, then Undo everything", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new HistoryManager();

        const a = new Switch();
        const b = new LED();
        const n = new DigitalNode();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b]).execute())

                .add(new ConnectionAction(designer, a.getOutputPort(0), b.getInputPort(0)).execute())

                .add(CreateSplitWireAction(designer, a.getOutputs()[0], n))

                .undo().undo().undo()
                .redo().redo().redo()
                .undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
});
