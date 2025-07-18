import type {GUID} from "shared/api/circuit/schema";
import type {Observable} from "shared/api/circuit/utils/Observable";

import type {DigitalSchema} from "../schema";


export interface ReadonlySimState {
    // PortID -> Signal
    readonly signals: Readonly<Record<GUID, DigitalSchema.Signal>>;
    // CompID -> number[]
    readonly states: Readonly<Record<GUID, number[]>>;
    // ICInstance(Comp)ID -> DigitalSimState
    readonly icStates: Readonly<Record<GUID, ReadonlySimState>>;
}
export type DigitalSimEv = {
    type: "step";
} | {
    type: "pause";
} | {
    type: "resume";
} | {
    type: "propagationTimeChanged";
    newTime: number;
}
export interface ReadonlyDigitalSim extends Observable<DigitalSimEv> {
    readonly propagationTime: number;
    readonly isPaused: boolean;

    readonly state: ReadonlySimState;
}
export interface DigitalSim extends ReadonlyDigitalSim {
    propagationTime: number;

    resume(): void;
    pause(): void;
    step(): void;

    sync(comps: GUID[]): void;
}
