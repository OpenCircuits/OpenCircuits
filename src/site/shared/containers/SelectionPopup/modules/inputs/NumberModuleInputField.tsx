import {useRef, useState} from "react";

import {Clamp} from "math/MathUtils";

import {NumberInputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<number, number> & {
    kind: "float" | "int";
    step?: number;
    min?: number;
    max?: number;
}
export const NumberModuleInputField = ({ kind, step, min, max, placeholder, alt, ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const Min = min ?? -Infinity;
    const Max = max ?? +Infinity;

    const [state, setState] = useBaseModule<number, number>({
        ...props,

        parseVal:      (val) => (kind === "float" ? parseFloat(val) : parseInt(val)),
        parseFinalVal: (val) => Clamp(val, Min, Max),
        isValid:       (val) => (!isNaN(val) && (Min <= val && val <= Max)),
    });

    // TODO: Maybe store this "modifier" as a state variable in base module?
    const [incrementState, setIncrementState] = useState({ total: 0, hasSet: false });

    // TODO: Make sure that this hasn't broken other number inputs
    //  also look into moving this logic into base module somehow
    //  specifically using `isValid`, and also make sure to look into
    //  values outside Min/Max with incrementation
    const onIncrement = (step: number) => {
        // If the props are the same (or has been set to be the same)
        //  and the current input value is not NaN, then just set the increment
        //  as a direct change since the props are all the same and don't need
        //  to be applied on a per-prop basis (or there isn't a modifier)
        if (!props.getModifierAction ||
            ((state.allSame || incrementState.hasSet) && !isNaN(ref.current!.valueAsNumber))) {
            const total = Clamp(ref.current!.valueAsNumber + step, Min, Max);
            setState.onChange(`${total}`);
            return;
        }

        // Otherwise, store the increment and use the onModify function to apply
        //  the increment on a per-prop basis
        const total = Clamp(incrementState.total + step, Min, Max);
        setIncrementState({ total, hasSet: false });
        setState.onModify(total);
    }

    return (
        <NumberInputField
            ref={ref}
            type="number"
            value={state.value}
            placeholder={state.allSame ? "" : (placeholder ?? "-")}
            onChange={(ev) => {
                setState.onChange(ev.target.value);
                // With manual user input, we gotta reset the increments
                setIncrementState({ total: 0, hasSet: true });
            }}
            onIncrement={onIncrement}
            onFocus={() => { setState.onFocus(); setIncrementState({ total: 0, hasSet: false }) }}
            onBlur={() => { setState.onBlur();  setIncrementState({ total: 0, hasSet: false }) }}
            min={min} max={max} step={step} alt={alt} />
    )
}
