import {serializable} from "serialeazy";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {Prop, PropInfo} from "core/models/PropInfo";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";
import {Positioner}              from "core/models/ports/positioners/Positioner";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort} from "digital/models/ports/InputPort";

import {SegmentType, Segments} from "./Segments";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        "segmentCount": {
            type:    "number[]",
            label:   "Segment Count",
            initial: 7,
            options: [["7", 7], ["9", 9], ["14", 14], ["16", 16]],
        },
    },
});

/**
 * Here we have the code that applies to the different segment displays.
 * There is the initial state within the constructor
 * and other functions that allow you to modify said segment display.
 */
@serializable("SegmentDisplay")
export class SegmentDisplay extends DigitalComponent {

    /**
     * Initializes a 7-segment display with input ports on the left side.
     *
     * @param numInputs  The number of inputs this display is allowed to have.
     * @param positioner The positioner used to position the ports.
     */
    public constructor(
        numInputs = new ClampedValue(7, 7, 16),
        positioner: Positioner<InputPort> = new ConstantSpacePositioner("left", 4*IO_PORT_RADIUS+0.04, false)
    ) {
        super(
            numInputs, new ClampedValue(0), V(1.4, 2),
            positioner, undefined, InitialProps
        );
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "segmentCount")
            this.setInputPortCount(val as number);
    }

    /**
     * Checks if each input port is connected to a power source that is on.
     *
     * @param segment The number of input ports.
     * @returns         If the ports are on as a boolean.
     */
    public isSegmentOn(segment: number): boolean {
        return this.getInputPort(segment).getIsOn();
    }

    /**
     * Gets the positions of the segemnts from the json file
     * depending on how many segments there are.
     *
     * @returns An array of Vectors and SegmentTypes.
     */
    public getSegments(): Array<[Vector, SegmentType]> {
        const segments = Segments[`${this.getSegmentCount()}`];

        // Turns the array into an array of Vectors and SegmentTypes
        return segments.map((value: [number[], SegmentType]) =>
            [V(value[0][0], value[0][1]), value[1]]
        );
    }

    /**
     * Gets the number of segements in a segment display.
     *
     * @returns The number of segements.
     */
    public getSegmentCount(): number {
        return this.getProp("segmentCount") as number;
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key] ?? super.getPropInfo(key);
    }

    /**
     * Gets the name to display for the history.
     *
     * @returns A string of the name to display in the history.
     */
    public getDisplayName(): string {
        return `${this.getSegmentCount()} Segment Display`;
    }
}
