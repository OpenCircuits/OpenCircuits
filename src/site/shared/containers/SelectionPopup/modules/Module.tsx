import {useLayoutEffect, useState, cloneElement} from "react";

import {Clamp} from "math/MathUtils";
import {Selectable} from "core/utils/Selectable";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {Action} from "core/actions/Action";


export type ModuleTypes = number | string;

export type ModuleConfig<T extends any[], P extends ModuleTypes> = {
    types: (Function & {prototype: T[number]})[];
    valType: "float" | "int" | "string";
    getProps: (o: T[number]) => P;
    getAction: (s: (T[number])[], newVal: P) => Action;
}

// export type ModuleConfig<T extends any[], P extends ModuleTypes> = {
//     types: (Function & {prototype: T[number]})[];
//     getProps: (o: T[number]) => P;
//     getAction: (s: (T[number])[], newVal: P) => Action;
// } &
//     (P extends number ? { valType: "float" | "int" } :
//     (P extends string ? { valType: "string" } :
//                         { valType: "boolean" }));

type State = {
    active: true;
    focused: boolean;
    textVal: string;
} | {
    active: false;
}

export type UseModuleProps = {
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
    alt: string;
}
type OtherModuleProps<T extends any[], P extends ModuleTypes> = {
    inputType: "text" | "color";
    config: ModuleConfig<T, P>;
    alt: string;
}

type ModuleProps<T extends any[], P extends ModuleTypes> =
    SelectModuleProps<T, P> | NumberModuleProps<T, P> | OtherModuleProps<T, P>;
export const CreateModule = (<T extends any[], P extends ModuleTypes>(props: ModuleProps<T, P>) => {
    let val: P;
    let same: boolean;
    let tempAction: Action;
    let prevDependencyStr: string;

    const {config} = props;


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

        useLayoutEffect(() => {
            // This means Selections changed, so we must check if
            //  we should should show this module or not
            if (selections.amount() === 0) {
                setState({active: false});
                return;
            }

            // Make sure all selections are exactly of types:
            const active = config.types.reduce((enabled, Type) =>
                enabled || (selections.get().filter(s => s instanceof Type).length === selections.amount()),
            false);
            if (!active) {
                setState({active: false});
                return;
            }

            const comps = selections.get() as T;

            const counts = comps.map(s => config.getProps(s));

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

            // Do action w/o saving it if the textVal is valid right now
            if (isValid(val)) {
                if (tempAction)
                    tempAction.undo();
                tempAction = config.getAction(selections.get() as T, val).execute();
                tempAction.execute();
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
            <input type={props.inputType}
                   value={focused ? textVal : (same ? val as (string | number) : "")}
                   placeholder={same ? "" : "-"}
                   step={"step" in props ? props.step : ""}
                   min ={"min"  in props ? props.min  : ""}
                   max ={"max"  in props ? props.max  : ""}
                   onChange={(ev) => onChange(ev.target.value)}
                   onFocus={() => setState({...state, focused: true, textVal: val.toString()})}
                   onBlur={() => onSubmit()}
                   onKeyPress={({target, key}) => (props.inputType !== "color" &&
                                                   key === "Enter" &&
                                                   (target as HTMLInputElement).blur())}
                   alt={props.alt} />
        )
    }
});




type ButtonModuleProps = UseModuleProps & {
    text: string;
    alt: string;
    getDependencies: (s: Selectable) => string;
    isActive: (selections: Selectable[]) => boolean;
    onClick: (selections: Selectable[]) => Action | void;
}
export const ButtonPopupModule = ({selections, text, alt, getDependencies, isActive, onClick, addAction, render}: ButtonModuleProps) => {
    const [state, setState] = useState({active: false});

    const dependencyStr = selections.get().reduce((c, s) => c + s.constructor.name + getDependencies(s), "");

    useLayoutEffect(() => {
        // This means Selections changed, so we must check if
        //  we should should show this module or not
        if (selections.amount() === 0) {
            setState({active: false});
            return;
        }

        setState({ active: isActive(selections.get()) });
    }, [selections, isActive, dependencyStr]);

    const click = () => {
        const a = onClick(selections.get());
        if (a)
            addAction(a);
        render();
    }

    if (!state.active)
        return null;

    return (
        <button title={alt}
                onClick={() => click()}>{text}</button>
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
                {ms.map((m, i) => cloneElement(m, {key: `selection-popup-${label}-module-${i}`}))}
            </label>
        </div>;
    }
});





// const Config: ModuleConfig<[Label], boolean> = {
//     types: [Label],
//     valType: "boolean",
//     getProps: (o) => o.getTextColor(),
//     getAction: (s, newCol) => new GroupAction(s.map(o => new LabelTextColorChangeAction(o, newCol)))
// }

// export const BusButtonModule = PopupModule({
//     label: "",
//     modules: [CreateModule({
//         inputType: "button",
//         text: "Bus",
//         config: Config,
//         alt: "Create a bus between selected ports"
//     })]
// });

// type BaseProps<T extends any[]> = {
//     allowedTypes: (Function & {prototype: T[number]})[];
// }
// type StatefulBaseProps<T extends any[], P extends (string | number)> = BaseProps<T> & {
//     getProps: (o: T[number]) => P;
//     getAction: (s: (T[number])[], newVal: P) => Action;
// }
// type InputBaseProps<T extends any[], P extends (string | number)> = StatefulBaseProps<T, P> & {
//     alt: string;
// }


// // type ButtonProps<T extends any[]> = BaseProps<T> & {
// //     inputType: "button";
// //     text: string;
// //     alt: string;
// //     onClick: () => void;
// // }

// type NumberProps<T extends any[]> = InputBaseProps<T, number> & {
//     inputType: "number";
//     valType: "int" | "float";
//     step?: number;
//     min?: number;
//     max?: number;
// }

// type ColorProps<T extends any[]> = InputBaseProps<T, string> & {
//     inputType: "color";
//     valType: "string";
// }

// type TextProps<T extends any[]> = InputBaseProps<T, string> & {
//     inputType: "text";
//     valType: "string";
// }

// type SelectProps<T extends any[]> = StatefulBaseProps<T, string | number> & {
//     inputType: "select";
//     options: (string | number)[];
// }




// type Props<T extends any[]> =
//     NumberProps<T> | ColorProps<T> | TextProps<T> | SelectProps<T>;
//     // (P extends number ? NumberProps<T> : ButtonProps<T>);


// function Test<T extends any[]>(props: Props<T>) {
//     if (props.inputType === "number") {
//         const {} = props;
//     } else {

//     }
// }



// Test<[Label]>({
//     allowedTypes: [Label],
//     inputType: "select",
//     options: [7, 9, 14],
//     getProps: (o) => o.getAngle(),
//     getAction: (s, newAngle) => new GroupAction()
// });


// Test<[Label]>({
//     allowedTypes: [Label],
//     inputType: "color",
//     valType: "string",
//     alt: "Color",
//     getProps: (o) => o.getTextColor(),
//     getAction: (s, newVal) => new GroupAction()
// });


// Test<[Clock, Label]>({
//     allowedTypes: [Clock, Label],
//     inputType: "text",
//     valType: "string",
//     alt: "String",
//     getProps: (o) => o.getName(),
//     getAction: (s, newVal) => new GroupAction()
// });


// Test<[Clock]>({
//     allowedTypes: [Clock],
//     inputType: "number",
//     valType: "int",
//     step: 100,
//     min: 200,
//     max: 10000,
//     alt: "Number",
//     getProps: (o) => o.getFrequency(),
//     getAction: (s, newFreq) => new GroupAction(s.map(o => new ClockFrequencyChangeAction(s, newFreq)))
// });



// Test<[Label]>({
//     allowedTypes: [Label],
//     inputType: "button",
//     text: "Bus",
//     alt: "Create a bus between selected ports",
//     onClick: () => {}
// })
