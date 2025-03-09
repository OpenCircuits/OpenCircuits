import {Circuit, Obj, Prop}                      from "shared/api/circuit/public";
import React, {useCallback, useEffect, useState} from "react";


// type ToArray<T> = T extends T ? T[] : never;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type RecordOfArrays<Props extends Record<string, Prop>> = {
    // Get every key from all records (if it's a union of records)
    [Key in KeysOfUnion<Props>]:
        // And map it to an array of non-nullable props
        Array<NonNullable<
            // Get each prop that is associated with the current Key
            (Props extends { [k in Key]?: unknown }
                // Do this distributively otherwise it'll only get the
                //  intersection props that all the Records have
                ? Props[Key]
                : never)
        >>;
}

const propsEquals = (oldProps: Record<string, Prop[]> | undefined, newProps: Record<string, Prop[]>): boolean => {
    if (!oldProps)
        return false;
    // Check if every key is the same
    if (!Object.keys(newProps).every((key) => (key in oldProps)))
        return false;
    // Make sure every entry has equal values
    return Object.entries(newProps).every(([key, arr]) => (
        (arr.length === oldProps[key].length) &&
        (arr.every((val, i) => (val === oldProps[key][i])))
    ));
}

export const useSelectionProps = <O extends Obj, Props extends Record<string, Prop>>(
    circuit: Circuit,
    validTypes: (s: Obj) => s is O,
    getProps: (s: O) => Props,
    deps: React.DependencyList = [],
    ignore: (s: Obj) => boolean = () => false,
) => {
    const [props, setProps] = useState(undefined as RecordOfArrays<Props> | undefined);
    const [objs, setObjs] = useState<O[]>([]);

    // This function is theoretically called anytime the Selections
    //  or their properties change
    const updateState = useCallback(() => {
        // Get selections with ignored types filtered out
        const selections = circuit.selections.filter((s) => !ignore(s));

        // Ensure we only have the acceptable types selected
        if (objs.length !== selections.length) {
            setProps(undefined);
            return;
        }

        const allProps = objs.map((s) => getProps(s));
        if (allProps.length === 0) {
            setProps(undefined);
            return;
        }

        // Filter out keys that not all the objects have
        const keys = Object.keys(allProps[0])
            .filter((key) => (allProps.every((prop) => (key in prop)))) as Array<keyof Props>;
        if (keys.length === 0) {
            setProps(undefined);
            return;
        }

        const newProps = Object.fromEntries(
            keys.map((key) =>
                [key, allProps.map((p) => p[key])])
        ) as RecordOfArrays<Props>;

        // Check if the props are the same, and if so, don't set
        //  so we don't cause unnecessary updates and potential flickers
        //  from a `forceUpdate`
        setProps((oldProps) => (propsEquals(oldProps, newProps) ? oldProps : newProps));
    }, [objs, ...deps]);

    // When number of selections change, update the list of objects
    useEffect(() =>
        circuit.selections.observe(() =>
            setObjs(circuit.selections
                    .filter((s) => !ignore(s))
                    .filter(validTypes))),
        [setObjs]);

    // When the list of objects changes, update the props
    //  and then listen for any circuit changes
    //  TODO[model_refactor](leon) - Maybe somehow just listen to changes to objs
    useEffect(() => {
        updateState();
        return circuit.subscribe(() => updateState())
    }, [updateState]);

    return [props, objs, updateState] as const;
}
