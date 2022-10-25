import React, {useCallback, useEffect, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Prop}   from "core/models/PropInfo";
import {AnyObj} from "core/models/types";


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

// type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// // expands object types recursively
// type ExpandRecursively<T> = T extends object
//   ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
//   : T;
// type Test = ExpandRecursively<RecordOfArrays<AnyObj, AnyObj>>;

// type Test2 = Expand<keyof Test>;

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

export const useSelectionProps = <Obj extends AnyObj, Props extends Record<string, Prop>>(
    info: CircuitInfo,
    validTypes: (s: AnyObj) => s is Obj,
    getProps: (s: Obj) => Props,
    deps: React.DependencyList = [],
    ignore: (s: AnyObj) => boolean = () => false,
) => {
    const [props, setProps] = useState(undefined as RecordOfArrays<Props> | undefined);

    // This function is theoretically called anytime the Selections
    //  or their properties change
    const updateState = useCallback(() => {
        // Get selections with ignored types filtered out
        const selectedObjs = info.selections.get().map((id) => info.circuit.getObj(id)!);
        const selections = selectedObjs.filter((s) => !ignore(s));
        const filteredSelections = selections.filter(validTypes);

        // Ensure we only have the acceptable types selected
        if (filteredSelections.length !== selections.length) {
            setProps(undefined);
            return;
        }

        const allProps = filteredSelections.map((s) => getProps(s));
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
    }, deps);

    useEffect(() => {
        info.history.addCallback(updateState);
        info.selections.subscribe(updateState);

        return () => {
            info.history.removeCallback(updateState);
            info.selections.unsubscribe(updateState);
        }
    }, [updateState]);


    const filteredSelections = info.selections.get()
        .map((id) => info.circuit.getObj(id)!)
        .filter(validTypes);
    return [props, filteredSelections, updateState] as const;
}
