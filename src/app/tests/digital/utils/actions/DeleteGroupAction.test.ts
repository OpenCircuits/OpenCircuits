import {V} from "Vector";

import {linspace} from "math/MathUtils";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

import {LED} from "digital/models/ioobjects/outputs/LED";


describe("Delete Group Action", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

    afterEach(() => {
        designer.reset();
    });

    test("Basic Deletion of 1 object", () => {
        const [a] = Place(new Switch());

        expect(designer.getObjects()).toContain(a);

        const a1 = DeleteGroup(designer, [a]);

        expect(designer.getObjects()).not.toContain(a);

        a1.undo();

        expect(designer.getObjects()).toContain(a);
    });
    test("Basic Deletion of 1 wire", () => {
        const [a, b] = Place(new Switch(), new LED());
        const [] = Connect(a, b);

        expect(designer.getObjects()).toContain(a);

        const a1 = DeleteGroup(designer, [a]);

        expect(designer.getObjects()).not.toContain(a);

        a1.undo();

        expect(designer.getObjects()).toContain(a);
    });

    // See https://github.com/OpenCircuits/OpenCircuits/issues/902
    describe("Deletion of parts of Tree", () => {
        function PlaceTree() {
            const leds = new Array(8).fill(0).map((_) => Place(new LED())[0]);
            const nodes2 = new Array(4).fill(0).map((_) => Place(new DigitalNode())[0]);
            const nodes1 = new Array(2).fill(0).map((_) => Place(new DigitalNode())[0]);
            const [sw] = Place(new Switch());

            // Place LEDs vertically from [5, -5] to [5, +5]
            linspace(-5, 5, 8).forEach((y, i) => leds[i].setPos(V(5, y)));

            // Place nodes in between the LEDs
            nodes2.forEach((n, i) => n.setPos(V(3, (leds[2*i].getPos().y +   leds[2*i+1].getPos().y)/2)));

            // Place other nodes between each of the other nodes
            nodes1.forEach((n, i) => n.setPos(V(2, (nodes2[2*i].getPos().y + nodes2[2*i+1].getPos().y)/2)));

            // Place switch in the middle of it all
            sw.setPos(V(0, 0));

            // Connections
            nodes1.forEach((n)    => Connect(sw, n));
            nodes2.forEach((n, i) => Connect(nodes1[Math.floor(i/2)], n));
              leds.forEach((l, i) => Connect(nodes2[Math.floor(i/2)], l));

            return [sw, nodes1, nodes2, leds] as const;
        }

        function expectTreePlacement([sw, nodes1, nodes2, leds]: ReturnType<typeof PlaceTree>) {
            expect(designer.getObjects()).toHaveLength(8+4+2+1);
            expect(designer.getWires()).toHaveLength(8+4+2);

            nodes1.forEach((n) => expect(sw).toBeConnectedTo(n, { depth: 1 }));
            nodes2.forEach((n) => expect(sw).toBeConnectedTo(n, { depth: 2 }));
              leds.forEach((l) => expect(sw).toBeConnectedTo(l, { depth: 3 }));
        }

        test("Delete Switch", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, [sw]);

            expect(designer.getObjects()).toHaveLength(8);
            expect(designer.getWires()).toHaveLength(0);

            // Make sure there are no nodes or switches left
            [sw, ...nodes1, ...nodes2].forEach((o) => expect(designer.getObjects()).not.toContain(o));

            // Make sure all the LEDs are the only things here
            leds.forEach((l) => expect(designer.getObjects()).toContain(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete All LEDs", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, leds);

            expect(designer.getObjects()).toHaveLength(1);
            expect(designer.getWires()).toHaveLength(0);

            // Make sure there are no nodes or leds left
            [...nodes1, ...nodes2, ...leds].forEach((o) => expect(designer.getObjects()).not.toContain(o));

            // Make sure Switch is the only thing here
            expect(designer.getObjects()).toContain(sw);

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete TOp 4 LEDs", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, leds.slice(0, 4));

            expect(designer.getObjects()).toHaveLength(1+1+2+4);
            expect(designer.getWires()).toHaveLength(1+2+4);

            // Expect switch to be connected only to bottom 4 LEDs
            leds.slice(0, 4).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(4)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete First layer of Nodes", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, nodes1);

            expect(designer.getObjects()).toHaveLength(9);
            expect(designer.getWires()).toHaveLength(0);

            // Make sure there are no nodes left
            [...nodes1, ...nodes2].forEach((o) => expect(designer.getObjects()).not.toContain(o));

            // Make sure Switch and LEDs are the only thing here
            expect(designer.getObjects()).toContain(sw);
            leds.forEach((l) => expect(designer.getObjects()).toContain(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Second layer of Nodes", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, nodes2);

            expect(designer.getObjects()).toHaveLength(9);
            expect(designer.getWires()).toHaveLength(0);

            // Make sure there are no nodes left
            [...nodes1, ...nodes2].forEach((o) => expect(designer.getObjects()).not.toContain(o));

            // Make sure Switch and LEDs are the only thing here
            expect(designer.getObjects()).toContain(sw);
            leds.forEach((l) => expect(designer.getObjects()).toContain(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Top First Wire", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, [sw.getOutputs()[0]]);

            expect(designer.getObjects()).toHaveLength(1+1+2+8);
            expect(designer.getWires()).toHaveLength(1+2+4);

            // Make sure top nodes are gone
            [...nodes1, ...nodes2]
                .filter((n) => n.getPos().y < 0)
                .forEach((o) => expect(designer.getObjects()).not.toContain(o));
            // And bottom ones are still here
            [...nodes1, ...nodes2]
                .filter((n) => n.getPos().y > 0)
                .forEach((o) => expect(designer.getObjects()).toContain(o));

            // Make sure Switch and LEDs are still here
            expect(designer.getObjects()).toContain(sw);
            leds.forEach((l) => expect(designer.getObjects()).toContain(l));

            // Expect switch to be connected only to bottom 4 LEDs
            leds.slice(0, 4).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(4)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Top Second Top Wire", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            // nodes1[0] is top node in first layer
            expect(sw.getOutputs()[0].getOutputComponent()).toEqual(nodes1[0]);

            const a1 = DeleteGroup(designer, [nodes1[0].getOutputs()[0]]);

            expect(designer.getObjects()).toHaveLength(1+2+3+8);
            expect(designer.getWires()).toHaveLength(2+3+6);

            // Expect switch to be connected only to bottom 6 LEDs
            leds.slice(0, 2).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(2)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Top-most Wire", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, [nodes2[0].getOutputs()[0]]);

            expect(designer.getObjects()).toHaveLength(1+2+4+8);
            expect(designer.getWires()).toHaveLength(2+4+7);

            // Expect switch to be connected only to bottom 7 LEDs
            leds.slice(0, 1).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(1)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Top-most 2 Wires", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, nodes2[0].getOutputs());

            expect(designer.getObjects()).toHaveLength(1+2+3+8);
            expect(designer.getWires()).toHaveLength(2+3+6);

            // Expect switch to be connected only to bottom 6 LEDs
            leds.slice(0, 2).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(2)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
        test("Delete Top 2 Second Layer Nodes", () => {
            const [sw, nodes1, nodes2, leds] = PlaceTree();

            const a1 = DeleteGroup(designer, [nodes2[0], nodes2[1]]);

            expect(designer.getObjects()).toHaveLength(1+1+2+8);
            expect(designer.getWires()).toHaveLength(1+2+4);

            // Expect switch to be connected only to bottom 4 LEDs
            leds.slice(0, 4).forEach((l) => expect(sw).not.toBeConnectedTo(l));
            leds.slice(4)   .forEach((l) => expect(sw).toBeConnectedTo(l));

            a1.undo();

            expectTreePlacement([sw, nodes1, nodes2, leds]);
        });
    });
});
