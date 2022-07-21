import {useEffect, useState} from "react";

import {Action} from "core/actions/Action";

import {Prop} from "core/models/PropInfo";



// TODO:
//  blech, nested setState callbacks hell
// checkout some useEffect / useCallback stuff might fix it somehow
// https://stackoverflow.com/questions/62236000/cannot-update-a-component-app-while-rendering-a-different-component
// https://stackoverflow.com/questions/67815231/warning-cannot-update-a-component-app-while-rendering-a-different-component
// https://github.com/FormidableLabs/urql/issues/1382

export type ModuleSubmitInfo = {
    isFinal: boolean;
    isValid: true;
    action: Action;
} | {
    isFinal: boolean;
    isValid: false;
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
    props: props.map(v => [v]),

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

    isValid:        (val: V[number], i: number) => boolean;
    parseVal:       (val: string,    i: number) => V[number];
    parseFinalVal?: (val: V[number], i: number) => V[number]; // TODO: CONSIDER REMOVING THIS

    getModifier?: (curMod: V[number] | undefined, newMod: V[number], i: number) => V[number];
    applyModifier?: (mod: V[number] | undefined, val: V[number], i: number) => V[number];

    getAction: (newVals: V[]) => Action;

    onSubmit: (info: ModuleSubmitInfo) => void;

    getCustomDisplayVal?: (val: V, i: number) => V[number];
}
export const useBaseModule = <V extends Primitive[]>({
    props, parseVal, isValid, parseFinalVal, getModifier,
    getAction, applyModifier, onSubmit, getCustomDisplayVal,
}: Props<V>) => {
    const len = props.reduce((max, vals) => Math.max(max, vals.length), 0);
    const indices = new Array(len).fill(0).map((_, i) => i);

    // Initialize state
    const initialState = {
        focused:      false,
        textVals:     new Array(len).fill("") as string[],
        modifiers:    new Array(len).fill(undefined) as Array<V[number] | undefined>,
        setProps:     [...props],
        initialProps: [...props],
        tempAction:   undefined as Action | undefined,

        submission: undefined as ModuleSubmitInfo | undefined,
    };
    const [state, setState] = useState(initialState);

    const { focused, textVals } = state;

    // Compute useful information
    const val0 = props[0];
    const allSame = indices.map((i) => props.every(v => v[i] === val0[i]));
    const values = indices.map((i) =>
        (focused
            ? textVals[i]
            : (allSame[i]
                ? (getCustomDisplayVal?.(val0, i) ?? val0[i])
                : ""))
    ) as Array<string | V[number]>;

    useEffect(() => {
        // Submit in an effect since it's a callback that has the potential to call other states
        if (!state.submission)
            return;
        onSubmit(state.submission);
        setState((prevState) => ({ ...prevState, submission: undefined }));
    }, [state.submission, onSubmit]);

    // onModify gets called when a "modification" is made to the current value of the properties
    //  i.e. arrow-keys to step a value
    const onModify = (mod: V[number], i = 0) => {
        if (!getModifier || !applyModifier)
            return;

        if (!focused)
            onFocus();

        // Wrap in `setState` in-case we aren't currently focused, and need the state from focusing
        setState(({ textVals, modifiers, tempAction, ...prevState }) => {
            tempAction?.undo(); // If tempAction exists, then undo it

            // Get new total modifier and insert into modifiers at `i`
            const newMod = getModifier(modifiers[i], mod, i);
            const newModifiers = [...modifiers.slice(0,i), newMod, ...modifiers.slice(i+1)];

            const moddedProps = prevState.setProps.map((prop) => (
                // Apply new modifiers to each prop
                prop.map((val, i) => applyModifier(newModifiers[i], val, i)) as V
            ));

            const action = getAction(moddedProps).execute();

            // If the props are the same, then show the new prop as a text value
            const newTextVal = (allSame[i] ? `${moddedProps[0][i]}` : textVals[i]);

            return {
                ...prevState,
                textVals:   [...textVals.slice(0,i), newTextVal, ...textVals.slice(i+1)],
                modifiers:  newModifiers,
                tempAction: action,
                submission: { isFinal: false, isValid: true, action },
            };
        });
    }

    // onChange gets called when the user directly sets the value of the property's value
    const onChange = (newVal: string, i = 0) => {
        if (!focused)
            onFocus();

        const val = parseVal(newVal, i);

        // If invalid input, assume it's temporary and just update the text value
        //  that they are typing
        if (!isValid(val, i)) {
            setState(({ textVals, ...prevState }) => ({
                ...prevState,
                textVals: [...textVals.slice(0,i), newVal, ...textVals.slice(i+1)],
            }));
            return;
        }

        // Wrap in `setState` in-case we aren't currently focused, and need the state from focusing
        setState(({ textVals, modifiers, setProps, tempAction, ...prevState }) => {
            tempAction?.undo(); // If tempAction exists, then undo it

            // Reset modifier at `i` since value is being set exactly
            const newModifiers = [...modifiers.slice(0,i), undefined, ...modifiers.slice(i+1)];

            const newProps = setProps.map((prop) => (
                // Insert new value into each prop
                [...prop.slice(0,i), val, ...prop.slice(i+1)] as V
            ));

            const moddedProps = newProps.map((prop) => (
                // Apply current modifiers to each prop
                prop.map((val, i) => (applyModifier?.(newModifiers[i], val, i) ?? val)) as V
            ));

            const action = getAction(moddedProps).execute();

            return {
                ...prevState,
                textVals:   [...textVals.slice(0,i), newVal, ...textVals.slice(i+1)],
                modifiers:  newModifiers,
                setProps:   newProps,
                tempAction: action,
                submission: { isFinal: false, isValid: true, action },
            };
        })
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
        setState(({ modifiers, setProps, initialProps, tempAction }) => {
            // If temp action doesn't exist, it means that the user didn't change anything
            //  so we should just do nothing and go back to normal
            if (!tempAction)
                return initialState;

            // Temp action exists, so undo it before committing final action
            tempAction.undo();

            // Calculate final props
            const finalProps = setProps.map((prop) => (
                // Apply current modifiers to each prop
                prop
                    .map((val, i) => (applyModifier?.(modifiers[i], val, i) ?? val))
                    .map((val, i) => (parseFinalVal?.(val,i) ?? val)) as V
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
                submission: { isFinal: true, isValid: true, action: getAction(finalProps).execute() },
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
