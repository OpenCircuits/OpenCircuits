import {useRef} from "react";

import {Clamp} from "math/MathUtils";

import {InputField} from "shared/components/InputField";

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
    });

    // TODO: Fix to 2 digits
    return (
        <InputField
            ref={ref}
            type="number"
            value={state.value}
            placeholder={state.allSame ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            min={min} max={max} step={step} alt={alt} />
    )
}
