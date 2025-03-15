import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";


declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R> {
            toBeOn(): CustomMatcherResult;
            toBeOff(): CustomMatcherResult;
            toBeStable(): CustomMatcherResult;
            toBeMetastable(): CustomMatcherResult;
        }
    }
}

expect.extend({
    toBeOn(received: Signal | DigitalComponent) {
        function check(signal: Signal) {
            return {
                message: () => "expected Signal to be On",
                pass:    (Signal.isOn(signal)),
            };
        }

        return typeof received === "number" ? check(received) : check(received.inputs[0].signal);
    },
    toBeOff(received: Signal | DigitalComponent) {
        function check(signal: Signal) {
            return {
                message: () => "expected Signal to be Off",
                pass:    (Signal.isOff(signal)),
            };
        }

        return typeof received === "number" ? check(received) : check(received.inputs[0].signal);
    },
    toBeStable(received: Signal | DigitalComponent) {
        function check(signal: Signal) {
            return {
                message: () => "expected Signal to be Stable (On | Off)",
                pass:    (Signal.isStable(signal)),
            };
        }

        return typeof received === "number" ? check(received) : check(received.inputs[0].signal);
    },
    toBeMetastable(received: Signal | DigitalComponent) {
        function check(signal: Signal) {
            return {
                message: () => "expected Signal to be Metastable",
                pass:    (Signal.isMetastable(signal)),
            };
        }

        return typeof received === "number" ? check(received) : check(received.inputs[0].signal);
    },
});
