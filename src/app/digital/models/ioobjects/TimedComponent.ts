import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Prop, PropInfo} from "core/models/PropInfo";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort, OutputPort} from "..";


const Info: Record<string, PropInfo> = {
    "delay": {
        type:  "int",
        label: "Delay",

        min: 50, max: 10_000, step: 50, initial: 1000,
    },
    "paused": {
        type:    "button",
        // label: (states, allSame) => {
        //     if (!allSame)
        //         return "Pause";
        //     return (states[0]["paused"] ? "Resume" : "Pause");
        // },
        initial: false,
    },
};

// export class Timer {
//     private timeout?: number;
//     private callback: () => void;

//     public constructor(callback: () => void) {
//         this.callback = callback;
//     }

//     public stopTimeout(): void {
//         // Clear the timeout if it's currently set
//         if (this.timeout !== undefined) {
//             window.clearTimeout(this.timeout);
//             this.timeout = undefined;
//         }
//     }

//     public tick(): void {
//         this.stopTimeout();


//     }
// }

export abstract class TimedComponent extends DigitalComponent {
    @serialize
    protected paused: boolean;

    private timeout?: number;

    public constructor(initialDelay: number, inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector,
                       inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>) {
        super(
            inputPortCount, outputPortCount, size,
            inputPositioner, outputPositioner,
            { "delay": initialDelay, "paused": false },
        );

        this.paused = false;
    }

    private stopTimeout(): void {
        // Clear the timeout if it's currently set
        if (this.timeout !== undefined) {
            window.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    protected abstract onTick(): void;

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "paused") {
            const paused = val as boolean;
            if (paused)
                this.stopTimeout();
            else
                this.tick();
        }
    }

    public tick(): void {
        this.stopTimeout();

        if (this.paused)
            return;

        this.onTick();

        // Send an update to the designer
        if (this.designer !== undefined)
            this.designer.forceUpdate();

        // Recursively call `tick` to continuously update
        this.timeout = window.setTimeout(() => {
            this.timeout = undefined;
            this.tick();
        }, this.getProp("delay") as number);
    }

    public pause(): void {
        this.paused = true;
        this.stopTimeout();
    }

    public resume(): void {
        this.paused = false;
        this.tick();
    }

    public override getPropInfo(key: string) {
        return Info[key];
    }

    public isPaused(): boolean {
        return this.paused;
    }

    // Restart ticking
    public reset(): void {
        if (!this.paused)
            this.tick();
    }
}
