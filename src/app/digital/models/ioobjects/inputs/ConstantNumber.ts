import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";
import {DecimalToBCD} from "math/MathUtils";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {Prop} from "core/models/PropInfo";

import {DigitalComponent} from "digital/models/DigitalComponent";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        "inputNum": {
            type:  "int",
            label: "Input Number",

            min: 0, max: 15, step: 1, initial: 0,
        },
    },
});

/**
 * A constant number input. This allows the user to control a 4 bit constant
 * output by using a single hexadecimal digit as input.
 */
@serializable("ConstantNumber")
export class ConstantNumber extends DigitalComponent {
    /**
     * Constructs a constant number input object.
     */
    public constructor() {
        super(
            new ClampedValue(0), new ClampedValue(4),
            V(1, 1), undefined, undefined,
            InitialProps,
        );
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "inputNum") {
            const inputNum = val as number;

            // Set output values to be the new input value
            const outputs = DecimalToBCD(inputNum);
            this.getOutputPorts().forEach((_, i) =>
                super.activate((i < outputs.length && outputs[i]), i)
            );
        }
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    /**
     * Gets the display name for a Constant Number object.
     *
     * @returns The display name "Constant Number".
     */
     public getDisplayName(): string {
        return "Constant Number";
    }
}
