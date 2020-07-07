import "jest";
import "test/helpers/Extensions";

import {Deserialize} from "serialeazy";

import "digital/models/ioobjects/index";
import "core/models/Circuit";

import {Circuit, ContentsData} from "core/models/Circuit";
import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models";

export function LoadCircuit(circuit: Circuit): CircuitDesigner {
    const data = Deserialize<ContentsData>(circuit.contents);
    return data.designer;
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchCircuit(expected: CircuitDesigner): CustomMatcherResult;
        }
    }
}

expect.extend({
    toMatchCircuit(received: any, expected: CircuitDesigner) {
        if (!(received instanceof CircuitDesigner)) {
            return {
                message: "expected type of CircuitDesigner",
                pass: false
            };
        }

        function expectSameComponent(c1: Component, c2: Component): void {
            expect(c1.getName()).toEqual(c2.getName());
            expect(c1.getPos()).toApproximatelyEqual(c2.getPos());
            expect(c1.getAngle()).toApproximatelyEqual(c2.getAngle());
            expect(c1.getConnections()).toHaveLength(c2.getConnections().length);
        }

        // Expect same objects
        expect(received.getObjects()).toHaveLength(expected.getObjects().length);
        received.getObjects().forEach((o1, i) => {
            const o2 = expected.getObjects()[i];
            expectSameComponent(o1, o2);
        });

        // Expect same wires
        expect(received.getWires()).toHaveLength(expected.getWires().length);
        received.getWires().forEach((w1, i) => {
            const w2 = expected.getWires()[i];

            expect(w1.getName()).toEqual(w2.getName());
            expect(w1.isStraight()).toEqual(w2.isStraight());

            expectSameComponent(w1.getP1Component(), w2.getP1Component());
            expectSameComponent(w1.getP2Component(), w2.getP2Component());
        })

        return {
            message: `expected ${received} to not be the same as ${expected}`,
            pass: true
        };
    }
});