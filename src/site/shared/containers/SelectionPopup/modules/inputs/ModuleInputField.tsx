import {useEffect, useState} from "react";

import {Action} from "core/actions/Action";

import {Prop} from "core/models/PropInfo";


export type ModuleSubmitInfo = {
    isFinal: boolean;
    action: Action;
}

export type SharedModuleInputFieldProps<V extends Prop> = {
    props: V[];

    getAction: (newVals: V[]) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
    getModifierAction?: (newMod: V) => Action;
    getCustomDisplayVal?: (val: V) => V;

    placeholder?: string;
    alt?: string;
}

export const DefaultConfig = <V extends Primitive>({
    props, getAction, onSubmit, getCustomDisplayVal,
}: Omit<SharedModuleInputFieldProps<V>, "alt" | "placeholder">): Omit<Props<[V]>, "parseVal"> => ({
    props: props.map((v) => [v]),

    isValid: (_) => true,

    getAction: (newVals) => getAction(newVals.map(([v]) => v)),

    onSubmit,
    getCustomDisplayVal: (getCustomDisplayVal
        ? (([v]) => getCustomDisplayVal!(v))
        : undefined),
})


type Primitive = string | number | boolean;
type Props<V extends Primitive[]> = {
    // `props` represents ALL the selected element's properties
    //  a single `prop` can contain multiple `val`s which represent
    //  x/y in a Vector or elements in an array
    props: V[];

    isValid:  (val: V[number], i: number) => boolean;
    parseVal: (val: string,    i: number) => V[number];
    fixVal?:  (val: V[number], i: number) => V[number];

    applyModifier?:   (val: V[number], mod: V[number] | undefined, i: number) => V[number];
    reverseModifier?: (val: V[number], mod: V[number] | undefined, i: number) => V[number];

    getAction: (newVals: V[]) => Action;

    onSubmit: (info: ModuleSubmitInfo) => void;

    getCustomDisplayVal?: (val: V, i: number) => V[number];
}
export const useBaseModule = <V extends Primitive[]>({
    props, parseVal, isValid, fixVal, applyModifier, reverseModifier,
    getAction, onSubmit, getCustomDisplayVal,
}: Props<V>) => {
    const len = props.reduce((max, vals) => Math.max(max, vals.length), 0);
    const indices = new Array(len).fill(0).map((_, i) => i);

    // Initialize state
    const initialState = {
        focused:      false,
        textVals:     new Array(len).fill("") as string[],
        // Modifiers are on a per-value and per-prop basis since, note that they are indexed by [value][prop]
        modifiers:    new Array(len).fill(0).map((_) => new Array<V[number] | undefined>(props.length).fill(undefined)),
        setProps:     [...props],
        initialProps: [...props],
        submission:   undefined as { isFinal: boolean, newProps: V[] } | undefined,
    };
    const [state, setState] = useState(initialState);

    const { focused, textVals } = state;

    // Compute useful information
    const val0 = props[0];
    const allSame = indices.map((i) => props.every((v) => v[i] === val0[i]));
    const values = indices.map((i) =>
        (focused
            ? textVals[i]
            : (allSame[i]
                ? (getCustomDisplayVal?.(val0, i) ?? val0[i])
                : ""))
    ) as Array<string | V[number]>;

    // Use effect necessary since `onSubmit` is a callback that can call other states
    //  also because we can't have unnecessary
    // This is all necessary because onChange/onModify/onFocus/onBlur use the functional form of
    //  setState since they have the ability to be called synchronously (i.e. in a Button Module)
    //  and React.StrictMode calls these functions twice to help debug side-effects.
    // So the side-effects are instead in this effect to create the actions and submit them to the callback
    useEffect(() => {
        // Submit in an effect since it's a callback that has the potential to call other states
        if (!state.submission)
            return;
        const { isFinal, newProps } = state.submission;

        const action = getAction(newProps);
        onSubmit({ isFinal, action });

        if (isFinal) // Reset submission if final
            setState((prevState) => ({ ...prevState, submission: undefined }));

        return () => {
            if (!isFinal) // Only undo on change if NOT the final submission
                action.undo();
        }
    }, [state.submission, getAction, onSubmit]);

    // onModify gets called when a "modification" is made to the current value of the properties
    //  i.e. arrow-buttons to step a value
    const onModify = (mod: V[number], i = 0) => {
        if (!applyModifier || !reverseModifier)
            return;

        if (!focused)
            onFocus();

        // Wrap in `setState` in-case we aren't currently focused, and need the state from focusing
        setState(({ textVals, modifiers, setProps, ...prevState }) => {
            // Calculate modifier from diffs of applied modifier. This is for the case where
            //  there're bounds on the final values and multiple props have different values.
            // As the value reaches its bound, it will get clamped and the modifier will then
            //  stop increasing/decreasing and thus needs to be also clamped based on the final value.
            const newMods = setProps.map((prop, j) => {
                // Get new modifier by appling the modifier to the current total modifier
                const newMod = applyModifier(mod, modifiers[i][j], i);

                // Then get the modified value by applying the modifier to the current value
                const moddedVal = applyModifier(prop[i], newMod, i);

                // Get fixed value from modded val, since modifiers are guaranteed to lead to valid results
                const fixedVal = (fixVal?.(moddedVal, i) ?? moddedVal);

                // Get the final modifier by reversing the modifier between the fixed value and the modded value
                //  and then applying that difference to the new modifier
                return applyModifier(reverseModifier(fixedVal, moddedVal, i), newMod, i);
            });

            // Insert final new modifier into modifiers at value `i`
            const newModifiers = [...modifiers.slice(0,i), newMods, ...modifiers.slice(i+1)];
            const newProps = setProps.map((prop,j) => (
                // Apply new modifiers to each prop
                prop.map((val, i) => applyModifier(val, newModifiers[i][j], i)) as V
            ));

            // If the props are the same, then show the new prop as a text value
            const allSame = newProps.every((v) => (v[i] === newProps[0][i]));
            const newTextVal = (allSame ? `${newProps[0][i]}` : textVals[i]);

            return {
                ...prevState, setProps,
                textVals:   [...textVals.slice(0,i), newTextVal, ...textVals.slice(i+1)],
                modifiers:  newModifiers,
                submission: { isFinal: false, newProps },
            };
        });
    }

    // onChange gets called when the user directly sets the value of the property's value
    const onChange = (newVal: string, i = 0) => {
        if (!focused)
            onFocus();

        // Wrap in `setState` in-case we aren't currently focused, and need the state from focusing
        setState(({ textVals, modifiers, setProps, ...prevState }) => {
            const val = parseVal(newVal, i);

            const newTextVals = [...textVals.slice(0,i), newVal, ...textVals.slice(i+1)];

            // If invalid input, assume it's temporary and just update the text value
            //  that they are typing
            if (!isValid(val, i))
                return { ...prevState, modifiers, setProps, textVals: newTextVals };

            // Reset modifier at `i` since value is being set exactly
            const newMods = new Array(props.length).fill(undefined);
            const newModifiers = [...modifiers.slice(0,i), newMods, ...modifiers.slice(i+1)];

            const newProps = setProps.map((prop) => (
                // Insert new value into each prop
                [...prop.slice(0,i), val, ...prop.slice(i+1)] as V
            ));

            const moddedProps = newProps.map((prop, j) => (
                // Apply current modifiers to each prop
                prop.map((val, i) => (applyModifier?.(val, newModifiers[i][j], i) ?? val)) as V
            ));

            return {
                ...prevState,
                textVals:   newTextVals,
                modifiers:  newModifiers,
                setProps:   newProps,
                submission: { isFinal: false, newProps: moddedProps },
            };
        });
    }

    // Focusing on the input will enter a sort-of new "mode" where
    //  temporary actions are generated when the user changes the value
    //  but does not register the actions to the history till the user
    //  is done fiddling with the value they want
    // In this mode, the user is also allowed to enter any text, even
    //  invalid text, and in the case of invalid text, a temporary action
    //  will not be created. This allows for the user to begin typing an
    //  invalid input without actually submitting, i.e.:
    //    User wants to type the number -.5
    //     > starts with just `-`   => invalid
    //     > then becomes     `-.`  => invalid
    //     > finally becomes  `-.5` => valid
    //   The input can temporarily be invalid while the user is typing
    //    and is why this is all necessary.
    const onFocus = () => {
        if (focused) // Skip if already focused
            return;

        // Wrap in `setState` so that serial calls to onFocus/onChange/onBlur work correctly (ButtonModule)
        setState((prevState) => ({
            ...prevState,
            focused: true,

            // On focus, if all same (displaying `val0`) then
            //  start user-input with `val0`, otherwise empty
            textVals: (allSame.map((same, i) => (same ? val0[i].toString() : ""))),

            setProps:     [...props],
            initialProps: [...props],
        }));
    }

    // Blurring should trigger a 'submit' so the user-inputted value
    //  is finally realized and registers an action to the circuit
    const onBlur = () => {
        setState(({ modifiers, setProps, initialProps, submission }) => {
            // If submission doesn't exist, it means that the user didn't change anything
            //  so we should just do nothing and go back to normal
            if (!submission)
                return initialState;

            // Calculate final props
            const finalProps = setProps.map((prop, j) => (
                // Apply current modifiers to each prop
                prop
                    .map((val, i) => (applyModifier?.(val, modifiers[i][j], i) ?? val))
                    .map((val, i) => (fixVal?.(val,i) ?? val)) as V
            ));

            // If every prop is the same as the initial props, then just reset back to initial state and do nothing
            if (finalProps.every((prop,j) =>
                    prop.every((val,i) => (val === initialProps[j][i]))
                )) {
                return initialState;
            }

            // Reset state with submission
            return {
                ...initialState,
                submission: { isFinal: true, newProps: finalProps },
            };
        });
    }

    return [
        {
            values,
            allSame,
        },
        {
            onChange,
            onFocus,
            onBlur,
            onModify,
        },
    ] as const;
}
