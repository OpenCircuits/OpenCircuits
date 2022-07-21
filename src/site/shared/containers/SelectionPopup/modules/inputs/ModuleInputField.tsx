import {useState} from "react";

import {Action} from "core/actions/Action";

import {Prop} from "core/models/PropInfo";


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
    const [focused,      setFocused]      = useState(false);
    const [textVals,     setTextVals]     = useState<string[]>(new Array(len).fill(""));
    const [modifiers,    setModifiers]    = useState<Array<V[number] | undefined>>(new Array(len).fill(undefined));
    const [setProps,     setSetProps]     = useState([...props]);
    const [initialProps, setInitialProps] = useState([...props]);
    const [tempAction,   setTempAction]   = useState<Action | undefined>(undefined);

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

    // Utility method to reset state back to initial
    const resetState = () => {
        setFocused(false);
        setTextVals(new Array(len).fill(""));
        setModifiers(new Array(len).fill(undefined));
        setSetProps([...props]);
        setInitialProps([...props]);
        setTempAction(undefined);
    }

    // onModify gets called when a "modification" is made to the current value of the properties
    //  i.e. arrow-keys to step a value
    const onModify = (mod: V[number], i = 0) => {
        if (!getModifier || !applyModifier)
            return;

        if (!focused)
            onFocus();

        tempAction?.undo(); // If tempAction exists, then undo it

        // Get new total modifier and insert into modifiers at `i`
        const newMod = getModifier(modifiers[i], mod, i);
        const newModifiers = [...modifiers.slice(0,i), newMod, ...modifiers.slice(i+1)];

        // Get current set of props which we have to do because
        //  there is a possiblity that we are not focused yet
        const curProps = (focused ? setProps : [...props]);

        const moddedProps = curProps.map((prop) => (
            // Apply new modifiers to each prop
            prop.map((val, i) => applyModifier(newModifiers[i], val, i)) as V
        ));

        const action = getAction(moddedProps).execute();
        onSubmit?.({ isFinal: false, isValid: true, action });

        // If the props are the same, then show the new prop as a text value
        const newTextVal = (allSame[i] ? `${moddedProps[0][i]}` : textVals[i]);

        setTextVals((textVals) => [...textVals.slice(0,i), newTextVal, ...textVals.slice(i+1)]);
        setModifiers(newModifiers);
        setTempAction(action);
    }

    // onChange gets called when the user directly sets the value of the property's value
    const onChange = (newVal: string, i = 0) => {
        if (!focused)
            throw new Error("Module Input Field: onChange called before focus!");

        const val = parseVal(newVal, i);

        // Insert newVal into text vals at `i`
        const newTextVals = [...textVals.slice(0,i), newVal, ...textVals.slice(i+1)];

        // If invalid input, assume it's temporary and just update the text value
        //  that they are typing
        if (!isValid(val, i)) {
            setTextVals(newTextVals);
            return;
        }

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
        onSubmit?.({ isFinal: false, isValid: true, action });

        setTextVals(newTextVals);
        setModifiers(newModifiers);
        setSetProps(newProps);
        setTempAction(action);
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

        setFocused(true);

        // On focus, if all same (displaying `val0`) then
        //  start user-input with `val0`, otherwise empty
        setTextVals((allSame.map((same, i) => (same ? val0[i].toString() : ""))));

        setSetProps([...props]);
        setInitialProps([...props]);
    }

    // Blurring should trigger a 'submit' so the user-inputted value
    //  is finally realized and registers an action to the circuit
    const onBlur = () => {
        if (!focused) // Skip if already not-focused
            return;

        // If temp action doesn't exist, it means that the user didn't change anything
        //  so we should just do nothing and go back to normal
        if (!tempAction) {
            resetState();
            return;
        }

        // Temp action exists, so undo it before committing final action
        tempAction.undo();

        // Calculate final props
        const finalProps = setProps.map((prop) => (
            // Apply current modifiers to each prop
            prop
                .map((val, i) => (applyModifier?.(modifiers[i], val, i) ?? val))
                .map((val, i) => (parseFinalVal?.(val,i) ?? val)) as V
        ));

        // Check to make sure that at least some final property has changed from
        //  the initial, otherwise don't submit
        if (!finalProps.every((prop,j) =>
                prop.every((val,i) => (val === initialProps[j][i]))
            )) {
            // Submit final valid action
            onSubmit?.({ isFinal: true, isValid: true, action: getAction(finalProps).execute() });
        }

        // Reset state
        resetState();
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
