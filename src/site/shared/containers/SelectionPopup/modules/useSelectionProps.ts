import {useCallback, useEffect, useMemo, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Selectable} from "core/utils/Selectable";


function test(thing: any): thing is Selectable {
    return true;
}

type GuardedType<T> = T extends (x: any) => x is (infer T) ? T : never;


type Tess = GuardedType<typeof test>;

type BaseType = Record<string, string | number | boolean>;
type RecordOfArrays<T extends BaseType> = {
    [Key in keyof T]?: Array<T[Key]>;
}

export const useSelectionProps = <T extends BaseType, V extends Selectable = Selectable>(
    info: CircuitInfo,
    validTypes: (s: Selectable) => s is V,
    getProps: (s: V) => T,
) => {
    const [props, setProps] = useState({} as RecordOfArrays<T>);

    // This function is theoretically called anytime the Selections
    //  or their properties change
    const updateState = useCallback(() => {
        const selections = info.selections.get();

        const allProps = selections.filter(validTypes).map(getProps);
        if (allProps.length === 0) {
            setProps({});
            return;
        }

        const props = Object.fromEntries(
            Object.keys(allProps[0]).map((key: keyof T) => (
                [key, allProps.map(p => p[key])] as const
            ))
        ) as RecordOfArrays<T>;

        setProps(props);
    }, []);

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
