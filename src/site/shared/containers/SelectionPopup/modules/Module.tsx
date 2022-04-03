import {useLayoutEffect, useState, cloneElement, useRef} from "react";

import {Clamp} from "math/MathUtils";
import {Selectable} from "core/utils/Selectable";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {Action} from "core/actions/Action";

import {InputField} from "shared/components/InputField";


export type ModuleTypes = number | string;

export type ModuleConfig<T extends any[], P extends ModuleTypes> = {
    types: (Function & {prototype: T[number]})[];
    valType: "float" | "int" | "string";
    isActive?: (selections: SelectionsWrapper) => boolean;
    getProps: (o: T[number]) => P | undefined;
    getAction: (s: (T[number])[], newVal: P) => Action;
    getDisplayVal?: (val: P) => string | number;
}

type State = {
    active: true;
    focused: boolean;
    textVal: string;
} | {
    active: false;
}

export type UseModuleProps = {
    key?: string;
    selections: SelectionsWrapper;
    addAction: (action: Action) => void;
    render: () => void;
}



type SelectModuleProps<T extends any[], P extends ModuleTypes> = {
    inputType: "select";
    config: ModuleConfig<T, P>;
    options: P[];
}
type NumberModuleProps<T extends any[], P extends ModuleTypes> = {
    inputType: "number";
    config: ModuleConfig<T, P>;
    step?: number;
    min?: number;
    max?: number;
    placeholder?: string;
    alt: string;
}
type OtherModuleProps<T extends any[], P extends ModuleTypes> = {
    inputType: "text" | "color";
    config: ModuleConfig<T, P>;
    placeholder?: string;
    alt: string;
}

type ModuleProps<T extends any[], P extends ModuleTypes> =
    SelectModuleProps<T, P> | NumberModuleProps<T, P> | OtherModuleProps<T, P>;
export const CreateModule = (<T extends any[], P extends ModuleTypes>(props: ModuleProps<T, P>) => {
    let val: P;
    let same: boolean;
    let tempAction: Action | undefined;
    let prevDependencyStr: string;

    const {config} = props;
    const displayVal = config.getDisplayVal ?? ((v) => (v as number | string));


    const parseVal = (s: string) => {
        switch (config.valType) {
            case "float":
                return parseFloat(s) as P;
            case "int":
                return parseInt(s) as P;
            case "string":
                return s as P;
        }
    }

    const isValid = (v: P) => {
        if (props.inputType === "number") {
            let mn = (props.min ?? -Infinity);
            let mx = (props.max ?? +Infinity);
            return !isNaN(v as number) && (mn <= v && v <= mx);
        }
        return true;
    }

    const parseFinalVal = (v: P) => {
        if (props.inputType === "number") {
            let mn = (props.min ?? -Infinity);
            let mx = (props.max ?? +Infinity);
            return Clamp(v as number, mn, mx) as P;
        }
        return v;
    }

    const filterTypes = (s: Selectable[]) => {
        return config.types.reduce((cur, Type) => [...cur, ...s.filter(s => s instanceof Type)], []) as T;
    }

    const getDependencies = (state: State, selections: SelectionsWrapper) => {
        let str = "";
        if (state.active && state.focused)
            return prevDependencyStr;
        str += filterTypes(selections.get()).map(s => config.getProps(s));
        prevDependencyStr = str;
        return str;
    }

    return function ModuleRender({selections, addAction, render}: UseModuleProps) {
        const [state, setState] = useState<State>({active: false});

        const numSelections = selections.amount();
        const dependencyStr = getDependencies(state, selections);

        const inputRef = useRef<HTMLInputElement>(null);

        useLayoutEffect(() => {
            // This means Selections changed, so we must check if
            //  we should should show this module or not
            if (selections.amount() === 0) {
                setState({active: false});
                return;
            }

            // Make sure all selections are exactly of types:
            const active = config.isActive?.(selections) ??
                config.types.reduce(
                    (enabled, Type) => enabled || (selections.get().filter(s => s instanceof Type).length === selections.amount()
                ),
            false);
            if (!active) {
                setState({active: false});
                return;
            }

            const comps = selections.get() as T;

            const counts = comps
                .map(s => config.getProps(s))
                .filter(s => (s !== undefined)) as P[];

            same = counts.every(c => (c === counts[0]));
            val = counts[0];

            setState({
                active: true,
                focused: false,
                textVal: (same ? val.toString() : "")
            });
        }, [selections, numSelections, dependencyStr]);

        if (!state.active)
            return null;

        const {focused, textVal} = state;

        const onChange = (newVal: string) => {
            const val = parseVal(newVal);

            // Due to Firefox not focusing when the arrow keys
            //  are pressed on number inputs (issue #818)
            if (inputRef?.current)
                inputRef.current.focus();

            // Do action w/o saving it if the textVal is valid right now
            if (isValid(val)) {
                if (tempAction)
                    tempAction.undo();
                tempAction = config.getAction(selections.get() as T, val).execute();
                render();
            }

            setState({...state, textVal: newVal});
        }
        const onSubmit = () => {
            // If temp action doesn't exist, it means that nothing was changed
            //  So we shouldn't commit an action if nothing changed
            if (!tempAction) {
                setState({...state, focused: false});
                render();
                return;
            }

            // Temp action exists, so undo it before committing the final action
            tempAction.undo();
            tempAction = undefined;

            const finalVal = parseFinalVal(parseVal(textVal));
            if (!isValid(finalVal)) {
                // Invalid final input, so reset back to starting state
                setState({...state, focused: false, textVal: val.toString()});
                render();
                return;
            }

            const action = config.getAction(selections.get() as T, finalVal).execute();
            addAction(action);
            render();

            // When submitting, it will be true
            //  that all the values are the same
            //  and they will all be `newVal`
            val = finalVal;
            same = true;

            setState({...state, focused: false});
        }

        if (props.inputType === "select") {
            return (
                <select value={focused ? textVal : (same ? val as (string | number) : "")}
                        onChange={(ev) => onChange(ev.target.value)}
                        onFocus={() => setState({...state, focused: true, textVal: val.toString()})}
                        onBlur={() => onSubmit()}>
                    {props.options.map((o, i) =>
                        <option key={`selection-popup-select-option-${o}-${i}`}
                                value={o as (string | number)}>{o}</option>
                    )}
                </select>
            )
        }

        return (
            <InputField ref={inputRef}
                        type={props.inputType}
                        value={focused ? textVal : ((same ? displayVal(val) : ""))}
                        placeholder={same ? "" : (props.placeholder ?? "-")}
                        step={"step" in props ? props.step : ""}
                        min ={"min"  in props ? props.min  : ""}
                        max ={"max"  in props ? props.max  : ""}
                        onChange={(ev) => onChange(ev.target.value)}
                        onFocus={() => setState({...state, focused: true, textVal: (same ? val.toString() : "")})}
                        onBlur={() => onSubmit()}
                        onEnter={({target}) => (props.inputType !== "color" &&
                                               (target as HTMLInputElement).blur())}
                        alt={props.alt} />
        )
    }
});




type ButtonModuleProps = UseModuleProps & {
    text: string | ((selections: Selectable[]) => string);
    alt: string;
    getDependencies: (s: Selectable) => string;
    isActive: (selections: Selectable[]) => boolean;
    onClick: (selections: Selectable[]) => Action | void;
}
export const ButtonPopupModule = ({selections, text, alt, getDependencies, isActive, onClick, addAction, render}: ButtonModuleProps) => {
    // This "state" represents the "dependencies" that this module requires from the selections
    //  and is in string form so that the React state can properly detect the changes
    const buildState = () =>
        selections.get().reduce((c, s) => c + s.constructor.name + getDependencies(s), "");

    const [_, setState] = useState("");


    // Subscribe to selection changes and update the dependency string
    useLayoutEffect(() => {
        const update = () => setState(buildState());

        selections.addChangeListener(update);
        return () => selections.removeChangeListener(update);
    }, [selections, setState]);


    const click = () => {
        const a = onClick(selections.get());
        if (a)
            addAction(a);
        render();
        setState(buildState());
    }


    const active = selections.amount() === 0 ? false : isActive(selections.get());
    if (!active)
        return null;

    return (
        <button
            title={alt}
            // When the create IC button is clicked, it must be blurred so that when enter is pressed to
            // to confirm creation of the IC, the create button in the selection popup does not also register
            // an enter press (Resulted in immediately opening a new IC creator with the newly made IC as the only target).
            onClick={(ev) => {
                click();
                ev.currentTarget.blur();
            }}>
            {(typeof text === "string" ? text : text(selections.get()))}
        </button>
    )
}




type PopupModuleProps = {
    label: string;
    modules: ReturnType<typeof CreateModule>[];
}
export const PopupModule = (({label, modules}: PopupModuleProps) => {
    return function PopupModuleFunc (props: UseModuleProps) {
        const ms = modules.map(m => m(props));
        if (ms.every(m => m === null))
            return null;
        return <div key={`selection-popup-${label}-module`}>
            {label}
            <label unselectable="on">
                {ms.map((m, i) => cloneElement(m!, {key: `selection-popup-${label}-module-${i}`}))}
            </label>
        </div>;
    }
});
