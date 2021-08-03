import {DigitalComponent} from "digital/models";
import "jest";

declare global {
    namespace jest {
        interface Matchers<R> {
            toApproximatelyEqual(expected: any, epsilon?: number): CustomMatcherResult;
            toBeCloseToAngle(otherAngle: number, epsilon?: number): CustomMatcherResult;
            toBeConnectedTo(a: DigitalComponent, options?: {depth?: number}): CustomMatcherResult;
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
    },

    toBeCloseToAngle(received: any, otherAngle: number, epsilon: number = 1e-4) {
        // If both are numbers, then pass
        if (!isNaN(received) && !isNaN(otherAngle)) {
            const diff = Math.atan2(Math.sin(otherAngle - received), Math.cos(otherAngle - received));
            const pass = Math.abs(diff) <= epsilon;
            return {
                message: () => `expected angle ${received*180/Math.PI}° ${pass ? "" : "not "}to be approximately equal to angle ${otherAngle*180/Math.PI}°`,
                pass
            };
        }

        return {
            message: () => `expected ${received} and ${otherAngle} to be numbers (angles)`,
            pass: false
        };
    },

    toBeConnectedTo(source: any, target: DigitalComponent, options = {depth: Infinity}) {
        if (!(source instanceof DigitalComponent))
            throw new Error(`toBeConnectedTo can only be used with DigitalComponents!`);

        let {depth} = options;

        let pass = false;

        const visited = new Set<DigitalComponent>();
        const queue = [source];
        while (queue.length > 0 && depth > 0) {
            const [cur] = queue.splice(0, 1);
            visited.add(cur);

            const connections = [
                ...cur.getOutputs().map(w => w.getOutputComponent()),
                ...cur.getInputs().map(w => w.getInputComponent())
            ];
            for (const c of connections) {
                if (c === target) {
                    pass = true;
                    depth = -1;
                    break;
                }
                if (!visited.has(c))
                    queue.push(c);
            }

            depth--;
        }

        return {
            message: () => `expected ${source.getName()} to ${pass ? `` : `not `}be connected to ${target.getName()} within ${options.depth} connections`,
            pass
        };
    },
});