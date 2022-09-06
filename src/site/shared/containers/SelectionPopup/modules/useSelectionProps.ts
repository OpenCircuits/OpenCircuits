import React, {useCallback, useEffect, useState} from "react";

import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Selectable}  from "core/utils/Selectable";


type BaseType = Record<string, string | number | Vector | boolean>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToArray<Type> = Type extends any ? Type[] : never;
type RecordOfArrays<T extends BaseType> = {
    [Key in keyof T]: ToArray<T[Key]>;
}

export const useSelectionProps = <T extends BaseType, V extends Selectable = Selectable>(
    info: CircuitInfo,
    validTypes: (s: Selectable) => s is V,
    getProps: (s: V) => T,
    deps: React.DependencyList = [],
    ignore: (s: Selectable) => boolean = () => false,
) => {
    const [props, setProps] = useState(undefined as RecordOfArrays<T> | undefined);

    // This function is theoretically called anytime the Selections
    //  or their properties change
    const updateState = useCallback(() => {
        // Get selections with ignored types filtered out
        const selections = info.selections.get().filter((s) => !ignore(s));
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
            .filter((key) => (allProps.every((prop) => (key in prop))));
        if (keys.length === 0) {
            setProps(undefined);
            return;
        }


        const props = Object.fromEntries(
            keys.map((key: keyof T) => (
                [key, allProps.map((p) => p[key])] as const
            ))
        ) as RecordOfArrays<T>;

        setProps(props);
    }, deps);

    useEffect(() => {
        info.history.addCallback(updateState);
        info.selections.addChangeListener(updateState);

        return () => {
            info.history.removeCallback(updateState);
            info.selections.addChangeListener(updateState);
        }
    }, [updateState]);


    const filteredSelections = info.selections.get().filter(validTypes);
    return [props, filteredSelections, updateState] as const;
}
