import {Clamp} from "math/MathUtils";

import {NumberInputField} from "shared/site/components/InputField";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";
import {useCallback} from "react";


type Props = SharedModuleInputFieldProps<number> & {
    kind: "float" | "int";
    step?: number;
    min?: number;
    max?: number;
    transform?: [(v: number) => number, (v: number) => number];
}
export const NumberModuleInputField = ({
    kind, step, min, max, transform, placeholder, alt, props,
    getCustomDisplayVal, doChange, ...otherProps
}: Props) => {
    const Min = min ?? -Infinity;
    const Max = max ?? +Infinity;

    const [forwardTransform, inverseTransform] = transform ?? [(v: number) => v, (v: number) => v];

    const doTransformedChange = useCallback(
        (newVals: number[]) => doChange(newVals.map(inverseTransform)),
        [doChange]);

    const [state, setState] = useBaseModule<[number]>({
        ...DefaultConfig({
            ...otherProps,
            props:    props.map(forwardTransform),
            doChange: doTransformedChange,
            getCustomDisplayVal,
        }),

        isValid:  (val) => (!isNaN(val) && (Min <= val && val <= Max)),
        parseVal: (val) => (kind === "float" ? parseFloat(val) : parseInt(val)),
        fixVal:   (val) => Clamp(val, Min, Max),

        applyModifier:   (val, step) => (val + (step ?? 0)),
        reverseModifier: (val, step) => (val - (step ?? 0)),

        getCustomDisplayVal: (([v]) =>
            // Default to rounding to two digits
            (getCustomDisplayVal ?? ((v) => parseFloat(v.toFixed(2))))(v)
        ),
    });

    return (
        <NumberInputField
            type="number"
            value={state.values[0]}
            min={min} max={max} step={step} alt={alt}
            placeholder={state.allSame[0] ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onIncrement={(step) => setState.onModify(step)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()} />
    );
}
