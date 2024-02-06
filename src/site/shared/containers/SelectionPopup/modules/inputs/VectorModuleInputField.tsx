import {useRef} from "react";

import {V, Vector} from "Vector";

import {Clamp} from "math/MathUtils";

import {NumberInputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<Vector> & {
    kind: "float" | "int";
    step?: Vector;
    min?: Vector;
    max?: Vector;
}
export const VectorModuleInputField = ({
    kind, step, min, max, placeholder, alt, props, getAction, onSubmit, getCustomDisplayVal,
}: Props) => {
    const xRef = useRef<HTMLInputElement>(null);
    const yRef = useRef<HTMLInputElement>(null);

    const Min = [min?.x ?? -Infinity, min?.y ?? -Infinity] as const;
    const Max = [max?.x ?? +Infinity, max?.y ?? +Infinity] as const;

    const [state, setState] = useBaseModule<[number, number]>({
        props: props.map((v) => [v.x, v.y]),

        isValid:  (val, i) => (!isNaN(val) && Min[i] <= val && val <= Max[i]),
        parseVal: (val)    => (kind === "float" ? parseFloat(val) : parseInt(val)),
        fixVal:   (val, i) => Clamp(val, Min[i], Max[i]),

        applyModifier:   (val, step) => (val + (step ?? 0)),
        reverseModifier: (val, step) => (val - (step ?? 0)),

        getAction: (newVals) => getAction(newVals.map(([x, y]) => V(x, y))),

        onSubmit,
        getCustomDisplayVal: (([x,y], i) => {
            // Default to rounding to two digits
            const display = (getCustomDisplayVal ?? ((v) => V(
                parseFloat(v.x.toFixed(2)),
                parseFloat(v.y.toFixed(2))
            )))(V(x,y));
            return [display.x, display.y][i];
        }),
    });

    return (<>
        <NumberInputField
            ref={xRef}
            type="number"
            value={state.values[0]}
            min={min?.x} max={max?.x} step={step?.x} alt={alt}
            placeholder={state.allSame[0] ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value, 0)}
            onIncrement={(step) => setState.onModify(step, 0)}
            onFocus={() => setState.onFocus()}
            onBlur={(e) => {
                // Allows the action to only be submitted once both fields have blurred
                if (e.relatedTarget !== yRef.current)
                    setState.onBlur();
            }} />
        <NumberInputField
            ref={yRef}
            type="number"
            value={state.values[1]}
            min={min?.y} max={max?.y} step={step?.y} alt={alt}
            placeholder={state.allSame[1] ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value, 1)}
            onIncrement={(step) => setState.onModify(step, 1)}
            onFocus={() => setState.onFocus()}
            onBlur={(e) => {
                // Allows the action to only be submitted once both fields have blurred
                if (e.relatedTarget !== xRef.current)
                    setState.onBlur();
            }} />
    </>);
}
