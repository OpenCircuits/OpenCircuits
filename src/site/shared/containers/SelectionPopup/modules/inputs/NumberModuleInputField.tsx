import {Clamp} from "math/MathUtils";

import {NumberInputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<number> & {
    kind: "float" | "int";
    step?: number;
    min?: number;
    max?: number;
}
export const NumberModuleInputField = ({
    kind, step, min, max, placeholder, alt, props, getAction, onSubmit, getCustomDisplayVal,
}: Props) => {
    const Min = min ?? -Infinity;
    const Max = max ?? +Infinity;

    const [state, setState] = useBaseModule<[number]>({
        props: props.map((v) => [v]),

        isValid:  (val) => (!isNaN(val) && (Min <= val && val <= Max)),
        parseVal: (val) => (kind === "float" ? parseFloat(val) : parseInt(val)),
        fixVal:   (val) => Clamp(val, Min, Max),

        applyModifier:   (val, step) => (val + (step ?? 0)),
        reverseModifier: (val, step) => (val - (step ?? 0)),

        getAction: (newVals) => getAction(newVals.map(([v]) => v)),

        onSubmit,
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
