

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

// DISCUSS: better name for this
const BOOL = (func: (a: boolean, b: boolean) => boolean) => (
    (a: Signal, b: Signal) => {
        if (a === Signal.Metastable || b === Signal.Metastable)
            return Signal.Metastable;
        return Signal.fromBool(func(Signal.isOn(a), Signal.isOn(b)));
    }
);
const AND = BOOL((a, b) => (a && b));
