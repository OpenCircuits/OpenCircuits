import {useCallback, useEffect, useMemo, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Selectable} from "core/utils/Selectable";


type BaseType = Record<string, string | number | boolean>;
type RecordOfArrays<T extends BaseType> = {
    [Key in keyof T]?: Array<T[Key]>;
}

export const useSelectionProps = <T extends BaseType>(info: CircuitInfo,
                                                      getProps: (s: Selectable) => (T | undefined)) => {
    const [props, setProps] = useState({} as RecordOfArrays<T>);

    // This function is theoretically called anytime the Selections
    //  or their properties change
    const updateState = useCallback(() => {
        const selections = info.selections.get();

        const allProps = selections.map(getProps).filter(s => (s !== undefined)) as T[];
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

    return [props, updateState] as const;
}
