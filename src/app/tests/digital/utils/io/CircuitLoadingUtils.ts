/* eslint-disable jest/no-standalone-expect */
import {Deserialize} from "serialeazy";

import "test/helpers/Extensions";

import {Component} from "core/models";

import {Circuit, ContentsData} from "core/models/Circuit";
import {CircuitMetadataDef}    from "core/models/CircuitMetadata";

import "digital/models/ioobjects";


type LoadedCircuit = {
    metadata: CircuitMetadataDef;
    contents: ContentsData;
}
export function LoadCircuit(circuit: Circuit): LoadedCircuit {
    return {
        metadata: circuit.metadata,
        contents: Deserialize<ContentsData>(circuit.contents),
    };
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R> {
            toMatchCircuit(expected: LoadedCircuit): CustomMatcherResult;
        }
    }
}

function isLoadedCircuit(c: unknown): c is LoadedCircuit {
    if (!c || typeof c !== "object")
        return false;
    return ("metadata" in c) && ("contents" in c);
}

expect.extend({
    toMatchCircuit(received: unknown, expected: LoadedCircuit) {
        if (!isLoadedCircuit(received)) {
            return {
                message: () => "expected type of LoadedCircuit",
                pass:    false,
            };
        }

        function expectSameComponent(c1: Component, c2: Component): void {
            expect(c1.getName()).toEqual(c2.getName());
            expect(c1.getPos()).toApproximatelyEqual(c2.getPos());
            // TODO: enable this
            // expect(c1.getSize()).toApproximatelyEqual(c2.getSize());
            expect(c1.getAngle()).toApproximatelyEqual(c2.getAngle());
            expect(c1.getConnections()).toHaveLength(c2.getConnections().length);

            // Expect all props to be the same
            Object.entries(c1.getProps()).forEach(([key, prop]) => {
                if (key === "size") // TODO: enable this
                    return;

                expect(c2.hasProp(key)).toBeTruthy();
                if (typeof prop === "string" || typeof prop === "boolean")
                    expect(c2.getProp(key)).toEqual(prop);
                else
                    expect(c2.getProp(key)).toApproximatelyEqual(prop);
            });
        }

        // Make sure metadata is the same
        expect(received.metadata.name).toEqual(expected.metadata.name);
        expect(received.metadata.desc).toEqual(expected.metadata.desc);

        // Make sure camera is the same
        const cam1 = received.contents.camera;
        const cam2 = expected.contents.camera;
        expect(cam1.getPos()).toApproximatelyEqual(cam2.getPos());
        expect(cam1.getZoom()).toApproximatelyEqual(cam2.getZoom());

        const circuit1 = received.contents.designer;
        const circuit2 = expected.contents.designer;

        // Expect same objects
        expect(circuit1.getObjects()).toHaveLength(circuit2.getObjects().length);
        circuit1.getObjects().forEach((o1, i) => {
            const o2 = circuit2.getObjects()[i];
            expectSameComponent(o1, o2);
        });

        // Expect same wires
        expect(circuit1.getWires()).toHaveLength(circuit2.getWires().length);
        circuit1.getWires().forEach((w1, i) => {
            const w2 = circuit2.getWires()[i];

            expect(w1.getName()).toEqual(w2.getName());
            expect(w1.isStraight()).toEqual(w2.isStraight());

            expectSameComponent(w1.getP1Component(), w2.getP1Component());
            expectSameComponent(w1.getP2Component(), w2.getP2Component());
        });

        return {
            message: () => `expected ${received} to not be the same as ${expected}`,
            pass:    true,
        };
    },
});
