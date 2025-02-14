import {useEffect} from "react";

import {InputAdapter, InputAdapterEvent, InputAdapterEventType} from "shared/api/circuitdesigner/input/InputAdapter";


export const useEvent = <T extends InputAdapterEventType>(type: T, f: (ev: InputAdapterEvent & {type: T}) => void,
                                              input?: InputAdapter, deps?: React.DependencyList) => {
    useEffect(() => {
        if (!input)
            return;

        const update = (ev: InputAdapterEvent) => {
            if (ev.type === type)
                f(ev as (InputAdapterEvent & {type: T}));
        }
        input.subscribe(update);
        return () => input.unsubscribe(update);
    }, [input, type, f, ...(deps ?? [])]);
}
