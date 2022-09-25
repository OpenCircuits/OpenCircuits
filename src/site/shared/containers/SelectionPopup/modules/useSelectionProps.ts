import React, {useCallback, useEffect, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {AnyObj} from "core/models/types";


// type ToArray<T> = T extends T ? T[] : never;
type KeysOfUnion<T> = T extends T ? keyof T : never;
type RecordOfArrays<Obj extends AnyObj, Props extends Partial<Obj>> = {
    [Key in KeysOfUnion<Props>]:
        Array<NonNullable<
            (Props extends { [k in Key]?: unknown }
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

export const useSelectionProps = <Obj extends AnyObj, Props extends Partial<Obj>>(
    info: CircuitInfo,
    validTypes: (s: AnyObj) => s is Obj,
    getProps: (s: Obj) => Props,
    deps: React.DependencyList = [],
    ignore: (s: AnyObj) => boolean = () => false,
) => {
    const [props, setProps] = useState(undefined as RecordOfArrays<Obj, Props> | undefined);

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

        const props = Object.fromEntries(
            keys.map((key) =>
                [key, allProps.map((p) => p[key])])
        ) as RecordOfArrays<Obj, Props>;

        setProps(props);
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
