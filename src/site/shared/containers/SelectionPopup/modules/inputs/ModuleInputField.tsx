import {useState} from "react";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";


export type ModuleSubmitInfo = {
    isFinal: boolean;
    isValid: true;
    action: Action;
} | {
    isFinal: boolean;
    isValid: false;
}

export type SharedModuleInputFieldProps<V extends Types> = {
    props: V[];

    getAction: (newVal: V) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
    getModifierAction?: (newMod: V) => Action;
    getCustomDisplayVal?: (val: V) => V;

    placeholder?: string;
    alt?: string;
}


type Types = string | number | boolean;
type State<V extends Types> = {
    focused: boolean;
    textVal: string;
    tempAction: Action | undefined;

    modifier: V | undefined;
    modifierAction: Action | undefined;
}
type Props<V extends Types> = {
    props: V[];

    parseVal: (val: string) => V;
    parseFinalVal?: (val: V) => V; // TODO: CONSIDER REMOVING THIS
    isValid: (val: V) => boolean;
    getModifier?: (curMod: V | undefined, newMod: V) => V;

    getAction: (newVal: V) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
    getModifierAction?: (newMod: V) => Action;
    getCustomDisplayVal?: (val: V) => V;
}
export const useBaseModule = <V extends Types>({
    props, parseVal, isValid, parseFinalVal, getModifier,
    getAction, getModifierAction, onSubmit, getCustomDisplayVal,
}: Props<V>) => {

    const [state, setState] = useState<State<V>>({
        focused:    false,
        textVal:    "",
        tempAction: undefined,

        modifier:       undefined,
        modifierAction: undefined,
    });

    const { focused, textVal, tempAction, modifier, modifierAction } = state;

    const allSame = props.every(v => v === props[0]);
    const val = props[0];
    const value = (focused ? textVal : (allSame ? (getCustomDisplayVal ?? ((v) => v))(val) : ""));

    const onModify = (mod: V) => {
        if (!getModifier)
            return;

        // Get parsed value from current text within the input itself
        //  (have to do this since we may not be currently focused, so
        //   onFocus hasn't been called yet to just set `textVal`)
        const val = parseVal(`${value}`);

        // If the props are the same (or has been set to be the same)
        //  and the current input value is not NaN, then just set the increment
        //  as a direct change since the props are all the same and don't need
        //  to be applied on a per-prop basis (or there isn't a modifier)
        if (!getModifierAction || ((allSame || tempAction) && isValid(val))) {
            onChange(`${getModifier(val, mod)}`);
            return;
        }

        // Otherwise, store the increment and use the onModify function to apply
        //  the increment on a per-prop basis
        const newMod = getModifier(modifier, mod);
        modifierAction?.undo();
        const action = getModifierAction(newMod).execute();

        onSubmit?.({ isFinal: false, isValid: true, action });
        setState({ ...state, focused: true, modifier: newMod, modifierAction: action });
    }

    const onChange = (newVal: string) => {
        const val = parseVal(newVal);

        // If invalid input, assume it's temporary and just update the text value
        //  that they are typing
        if (!isValid(val)) {
            setState({ ...state, textVal: newVal });
            return;
        }

        // Create new temporary action with new valid val
        modifierAction?.undo(); // If modifierAction exists, then undo it first
        tempAction?.undo(); // If tempAction exists, then undo it second
        const action = getAction(val).execute();
        onSubmit?.({ isFinal: false, isValid: true, action });

        // Reset modifier when state here since state is being set exactly
        setState({
            focused: true, textVal: newVal, tempAction: action, modifier: undefined, modifierAction: undefined,
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
    const onFocus = (modifier?: V) => {
        // On focus, if all same (displaying `val`) then
        //  start user-input with `val`, otherwise empty
        const textVal = (allSame ? val.toString() : "");
        setState({ focused: true, textVal, tempAction: undefined, modifier, modifierAction: undefined });
    }

    // Blurring should trigger a 'submit' so the user-inputted value
    //  is finally realized and registers an action to the circuit
    const onBlur = (modifier?: V) => {
        // If temp action doesn't exist, it means that the user didn't change anything
        //  so we should just do nothing and go back to normal
        if (!tempAction && !modifierAction) {
            setState({ ...state, focused: false });
            return;
        }

        // Temp action exists, so undo it before committing final action
        modifierAction?.undo();
        tempAction?.undo();

        if (!tempAction) {
            onSubmit?.({ isFinal: true, isValid: true, action: modifierAction!.execute() });
            setState({ ...state, focused: false, tempAction: undefined, modifierAction: undefined });
            return;
        }

        const finalVal = (parseFinalVal ?? ((v) => v))(parseVal(textVal));
        if (!isValid(finalVal)) {
            // Invalid final input, keep action un-done and stay at starting state
            setState({ ...state, focused: false, textVal: val.toString(), tempAction: undefined, modifier }); // <----- TODO: ?? val.toString() correct??
            onSubmit?.({ isFinal: true, isValid: false });
            return;
        }

        // Submit final valid action
        onSubmit?.({ isFinal: true, isValid: true, action: new GroupAction([
            getAction(finalVal),
            ...(modifierAction ? [modifierAction] : []),
        ]).execute() });

        // When submitting, it will be true that all the values are the same
        //  and they will all be `newVal`, so
        setState({ focused: false, textVal, tempAction: undefined, modifier, modifierAction: undefined });
    }

    return [
        {
            value,
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
