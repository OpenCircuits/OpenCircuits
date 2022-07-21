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
        props: props.map(v => [v]),

        isValid:       (val) => (!isNaN(val) && (Min <= val && val <= Max)),
        parseVal:      (val) => (kind === "float" ? parseFloat(val) : parseInt(val)),
        parseFinalVal: (val) => Clamp(val, Min, Max),

        getModifier:   (totalStep, step) => Clamp((totalStep ?? 0) + step, Min, Max),
        applyModifier: (step, val) => Clamp(val + (step ?? 0), Min, Max),

        getAction: (newVals) => getAction(newVals.map(([v]) => v)),

        onSubmit,
        getCustomDisplayVal: (getCustomDisplayVal
            ? (([v]) => getCustomDisplayVal!(v))
            : undefined
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
            onFocus={() => setState.onFocus(0)}
            onBlur={() => setState.onBlur(0)} />
    );
}
