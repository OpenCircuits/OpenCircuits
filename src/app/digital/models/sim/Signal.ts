

export enum Signal {
    Off        =  0,
    On         =  1,
    Metastable = -1,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Signal {
    export function fromBool(b: boolean): Signal {
        return (b) ? (Signal.On) : (Signal.Off);
    }
    export function isOn(s: Signal): boolean {
        return (s === Signal.On);
    }
    export function isOff(s: Signal): boolean {
        return (s === Signal.Off);
    }
    export function isStable(s: Signal): boolean {
        return (s !== Signal.Metastable);
    }
}

/**
 * Higher-order utility function that creates a signal reducer based on the given boolean reducer.
 *
 * The returned reducer can be used on an array of `Signal`s to reduce to a single `Signal`.
 *  (for use in AND/OR/XOR/etc gates).
 *
 * The reducer will return Metastable if and only if any of the values are Metastable, otherwise it will return
 *  the value of the given boolean reducer, using that `Signal.On` is `true` and `Signal.Off` is `false`.
 *
 * @param func A boolean reducer function to reduce signals that are `On` or `Off`.
 * @returns    A reducer function that can reduce an array of `Signal`s to a single `Signal`.
 */
export const SignalReducer = (func: (a: boolean, b: boolean) => boolean) => (
    (a: Signal, b: Signal) => {
        if (a === Signal.Metastable || b === Signal.Metastable)
            return Signal.Metastable;
        return Signal.fromBool(func(Signal.isOn(a), Signal.isOn(b)));
    }
);
