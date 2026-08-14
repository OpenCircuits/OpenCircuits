import type { GUID } from "shared/api/circuit/schema";
import type { Observable } from "shared/api/circuit/utils/Observable";

import type { DigitalSchema } from "../schema";
import type { Scheduler } from "./Scheduler";

export interface ReadonlySimState {
    // PortID -> Signal
    readonly signals: Readonly<Record<GUID, DigitalSchema.Signal>>;
    // CompID -> number[]
    readonly states: Readonly<Record<GUID, number[]>>;
    // ICInstance(Comp)ID -> DigitalSimState
    readonly icStates: Readonly<Record<GUID, ReadonlySimState>>;
}
export type DigitalSimEv =
    | {
          type: "step";
      }
    | {
          type: "pause";
      }
    | {
          type: "resume";
      }
    | {
          type: "propagationTimeChanged";
          newTime: number | undefined;
      };
export interface ReadonlyDigitalSim extends Observable<DigitalSimEv> {
    readonly propagationTime: number | undefined;
    readonly isPaused: boolean;
    readonly scheduler?: Scheduler;

    readonly state: ReadonlySimState;
}
export interface DigitalSim extends ReadonlyDigitalSim {
    propagationTime: number | undefined;

    setScheduler(scheduler: Scheduler | undefined): void;

    resume(): void;
    pause(): void;
    step(): void;

    sync(comps: GUID[]): void;
}
