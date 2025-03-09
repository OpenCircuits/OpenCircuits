import {Result} from "shared/api/circuit/utils/Result";
import crypto   from "node:crypto";
import {Component, Obj} from "../../src/public";


// Define crypto for Jest for uuid generation
Object.defineProperty(window, "crypto", { value: crypto });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R> {
            toApproximatelyEqual(expected: unknown, epsilon?: number): CustomMatcherResult;
            toBeCloseToAngle(otherAngle: number, epsilon?: number): CustomMatcherResult;
            toBeOk(): CustomMatcherResult;
            toIncludeError(message: string): CustomMatcherResult;
            toBeObj(obj: Obj): CustomMatcherResult;
            toEqualObj(obj: Obj): CustomMatcherResult;
            toContainObjs(objs: Obj[]): CustomMatcherResult;
            toContainObjsExact(objs: Obj[]): CustomMatcherResult;
            toBeConnectedTo(otherObj: Component): CustomMatcherResult;
            // toBeConnectedTo(a: DigitalComponent, options?: {depth?: number}): CustomMatcherResult;
        }
    }
}

function FormatObj(obj: Obj | undefined): string {
    return `${obj?.baseKind}[${obj?.kind}](id=${obj?.id})`;
}
function FormatObjWithProps(obj: Obj | undefined): string {
    return `${obj?.baseKind}[${obj?.kind}](props=${obj?.getProps()})`;
}
function FormatObjs(objs: Obj[]): string {
    return `[${objs.map(FormatObj).join(", ")}]`;
}
function SetDifference<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    const differenceSet = new Set<T>();
    for (const elem of s1) {
        if (!s2.has(elem)) {
            differenceSet.add(elem);
        }
    }
    return differenceSet;
}

expect.extend({
    toApproximatelyEqual(received: unknown, expected: unknown, epsilon = 1e-2) {
        // If types aren't same, then fail
        if (typeof(received) !== typeof(expected)) {
            return {
                message: () => `expected ${received} to be the same type as ${expected}`,
                pass:    false,
            };
        }

        // If both are numbers, then pass
        if (typeof(received) === "number" && typeof(expected) === "number") {
            const pass = Math.abs(received - expected) <= epsilon;
            return {
                message: () => `expected ${received} ${pass ? "" : "not "}to be approximately equal to ${expected}`,
                pass,
            };
        }

        const isRecord = (obj: unknown): obj is Record<string, unknown> => (obj instanceof Object);

        // For other non-number primitives, ignore and pass
        if (!isRecord(received) || !isRecord(expected)) {
            return {
                message: () => `expected ${received} and ${expected} to not be non-number primitives`,
                pass:    true,
            };
        }

        Object.keys(received).forEach((key) => {
            if (!(key in expected)) {
                return {
                    message: () => `expected ${expected} to have key ${key} that ${received} has`,
                    pass:    false,
                };
            }

            // eslint-disable-next-line jest/no-standalone-expect
            expect(received[key]).toApproximatelyEqual(expected[key], epsilon);
        });

        return {
            message: () => `expected ${received} not to be approximately equal to ${expected}`,
            pass:    true,
        };
    },

    toBeCloseToAngle(received: unknown, otherAngle: number, epsilon = 1e-4) {
        // If both are numbers, then pass
        if (typeof(received) === "number" && !isNaN(received) && !isNaN(otherAngle)) {
            const diff = Math.atan2(Math.sin(otherAngle - received), Math.cos(otherAngle - received));
            const pass = Math.abs(diff) <= epsilon;
            return {
                message: () => `expected angle ${received*180/Math.PI}° ${pass ? "" : "not "}` +
                               `to be approximately equal to angle ${otherAngle*180/Math.PI}°`,
                pass,
            };
        }

        return {
            message: () => `expected ${received} and ${otherAngle} to be numbers (angles)`,
            pass:    false,
        };
    },

    toBeOk(received: Result) {
        const result = received;
        if (result.ok) {
            return {
                message: () => "expected Result to be Ok",
                pass:    true,
            }
        }
        return {
            message: () => `expected Result to not have errors:\n - ${
                result.error.errors
                .map((err) => err.message)
                .join("\n - ")
            }`,
            pass: false,
        }
    },

    toIncludeError(received: Result, message: string) {
        const result = received;
        if (result.ok) {
            return {
                message: () => "expected Result to be not be Ok",
                pass:    false,
            }
        }
        return {
            message: () => `expected Result to contain an error including the text "${message}", ` +
                `instead includes:\n - ${
                    result.error.errors
                    .map((err) => err.message)
                    .join("\n - ")
                }`,
            pass: result.error.errors.some((error) => error.message.includes(message)),
        }
    },

    toBeObj(received: Obj | undefined, obj: Obj) {
        return {
            message: () => `expected ${FormatObj(received)} to be ${FormatObj(obj)}`,
            pass:    (received?.id === obj.id),
        }
    },

    // Everything (except id) is the same between two Objs
    toEqualObj(received: Obj | undefined, obj: Obj) {
        return {
            message: () => `expected ${FormatObjWithProps(received)} to equal ${FormatObjWithProps(obj)}`,
            pass:    (
                received?.baseKind === obj.baseKind
                && received.kind === obj.kind
                && received.getProps() === obj.getProps()
                && !(received.baseKind === "Port" && obj.baseKind === "Port"
                    && obj.group !== received.group && obj.index !== received.index)),
        }
    },

    toContainObjs(received: Obj[], objs: Obj[]) {
        const receivedIds = new Set(received.map((o) => o.id));
        const objs2 = objs.filter((o) => !receivedIds.has(o.id));
        return {
            message: () => `missing ${FormatObjs(objs2)} from ${FormatObjs(received)}`,
            pass:    objs2.length === 0,
        }
    },

    toContainObjsExact(received: Obj[], objs: Obj[]) {
        const receivedIds = new Set(received.map((o) => o.id));
        const objsIds = new Set(objs.map((o) => o.id));
        const receivedDiff = SetDifference(receivedIds, objsIds);
        if (receivedDiff.size > 0) {
            const receivedDiffsObjs = received.filter((o) => receivedDiff.has(o.id));
            return {
                message: () => `expected ${FormatObjs(receivedDiffsObjs)} to not be in ${FormatObjs(objs)}`,
                pass:    false,
            }
        }
        const objsDiff = SetDifference(objsIds, receivedIds);
        if (objsDiff.size > 0) {
            const objsDiffsObjs = objs.filter((o) => objsDiff.has(o.id));
            return {
                message: () => `expected ${FormatObjs(received)} to have ${FormatObjs(objsDiffsObjs)}`,
                pass:    false,
            }
        }
        return {
            message: () => "same objects",
            pass:    true,
        }
    },

    toBeConnectedTo(received: Component, otherObj: Component) {
        const pass = received.allPorts.some((port) =>
            port.connectedPorts.some((p) =>
                (p.parent.id === otherObj.id)));
        return {
            message: () => `expected ${FormatObj(received)} to be connected to ${FormatObj(otherObj)}`,
            pass,
        };
    },
});
