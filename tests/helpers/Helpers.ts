/* eslint-disable @typescript-eslint/no-namespace */

import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {GroupAction} from "core/actions/GroupAction";
import {DigitalWire} from "digital/models/DigitalWire";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

declare global {
    namespace jest {
        interface Matchers<R> {
            toApproximatelyEqual(expected: any, epsilon?: number): CustomMatcherResult;
        }
    }
}

expect.extend({
    toApproximatelyEqual(received: any, expected: any, epsilon: number = 1e-2) {
        // If both are numbers, then pass
        if (!isNaN(received) && !isNaN(expected)) {
            const pass = Math.abs(received - expected) <= epsilon;
            return {
                message: () => `expected ${received} ${pass ? "" : "not "}to be approximately equal to ${expected}`,
                pass
            };
        }

        // If types aren't same, then fail
        if (typeof(received) != typeof(expected)) {
            return {
                message: () => `expected ${received} to be the same type as ${expected}`,
                pass: false
            };
        }

        // For other non-number primitives, ignore and pass
        if (!(received instanceof Object)) {
            return {
                message: () => `expected ${received} and ${expected} to not be non-number primitives`,
                pass: true
            };
        }

        Object.keys(received).forEach((key) => {
            if (expected[key] == undefined) {
                return {
                    message: () => `expected ${expected} to have key ${key} that ${received} has`,
                    pass: false
                };
            }

            expect(received[key]).toApproximatelyEqual(expected[key], epsilon);
        });

        return {
            message: () => `expected ${received} not to be approximately equal to ${expected}`,
            pass: true
        };
    }
});

export function Place(designer: DigitalCircuitDesigner, objects: DigitalComponent[]): GroupAction {
    return CreateGroupPlaceAction(designer, objects).execute();
}

export function Connect(c1: DigitalComponent, i1: number, c2: DigitalComponent, i2: number): ConnectionAction {
    return new ConnectionAction(c1.getOutputPort(i1), c2.getInputPort(i2)).execute() as ConnectionAction;
}

export function Remove(objs: Array<DigitalComponent | DigitalWire>): GroupAction {
    return CreateDeleteGroupAction(objs).execute();
}