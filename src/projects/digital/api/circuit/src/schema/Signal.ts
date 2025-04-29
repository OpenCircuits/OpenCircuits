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
    export function toBool(s: Signal): boolean {
        return (s === Signal.On) ? (true) : (false);
    }
    export function invert(s: Signal): Signal {
        switch (s) {
            case Signal.On:
                return Signal.Off;
            case Signal.Off:
                return Signal.On;
            case Signal.Metastable:
                return Signal.Metastable;
        }
    }
    export function isOn(s: Signal): boolean {
        return (s === Signal.On);
    }
    export function isOff(s: Signal): boolean {
        return (s === Signal.Off);
    }
    export function isMetastable(s: Signal): boolean {
        return (s === Signal.Metastable);
    }
    export function isStable(s: Signal): boolean {
        return (s !== Signal.Metastable);
    }
}
