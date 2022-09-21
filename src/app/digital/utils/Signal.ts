

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
