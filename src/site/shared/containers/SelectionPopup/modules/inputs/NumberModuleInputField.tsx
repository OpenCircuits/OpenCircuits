import {useRef} from "react";

import {Clamp} from "math/MathUtils";

import {NumberInputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<number> & {
    kind: "float" | "int";
    step?: number;
    min?: number;
    max?: number;
}
export const NumberModuleInputField = ({ kind, step, min, max, placeholder, alt, ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const Min = min ?? -Infinity;
    const Max = max ?? +Infinity;

    const [state, setState] = useBaseModule<number>({
        ...props,

        parseVal:      (val) => (kind === "float" ? parseFloat(val) : parseInt(val)),
        parseFinalVal: (val) => Clamp(val, Min, Max),
        isValid:       (val) => (!isNaN(val) && (Min <= val && val <= Max)),

        getModifier: (totalStep, step) => Clamp((totalStep ?? 0) + step, Min, Max),
    });

    return (
        <NumberInputField
            ref={ref}
            type="number"
            value={state.value}
            min={min} max={max} step={step} alt={alt}
            placeholder={state.allSame ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onIncrement={(step) => setState.onModify(step)}
            onFocus={() => setState.onFocus(0)}
            onBlur={() => setState.onBlur(0)} />
    );
}
