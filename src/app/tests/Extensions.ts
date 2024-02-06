import {Result} from "core/utils/Result";
import crypto   from "node:crypto";


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
            // toBeConnectedTo(a: DigitalComponent, options?: {depth?: number}): CustomMatcherResult;
        }
    }
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
        const result = received as Result;
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
        const result = received as Result;
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
});
