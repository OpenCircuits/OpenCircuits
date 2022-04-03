import {useRef} from "react";

import {Clamp} from "math/MathUtils";

import {Action} from "core/actions/Action";

import {InputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps & {
    props: number[];
    getAction: (newVal: number) => Action;
    step?: number;
    min?: number;
    max?: number;
}
export const NumberModuleInputField = ({ props, getAction, onSubmit,
                                        placeholder, ...otherProps }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const min = otherProps.min ?? -Infinity;
    const max = otherProps.max ?? +Infinity;

    const [state, setState] = useBaseModule<number>({
        props, getAction, onSubmit,

        parseVal:      (val) => parseFloat(val),
        parseFinalVal: (val) => Clamp(val, min, max),
        isValid:       (val) => (!isNaN(val) && (min <= val && val <= max)),
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
            {...otherProps} />
    )
}
