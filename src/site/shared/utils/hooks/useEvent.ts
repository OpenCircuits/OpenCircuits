import {useEffect} from "react";

import {InputAdapter, InputManagerEvent, InputManagerEventType} from "shared/utils/input/InputAdapter";


export const useEvent = <T extends InputManagerEventType>(type: T, f: (ev: InputManagerEvent & {type: T}) => void,
                                              input?: InputAdapter, deps?: React.DependencyList) => {
    useEffect(() => {
        if (!input)
            return;

        const update = (ev: InputManagerEvent) => {
            if (ev.type === type)
                f(ev as (InputManagerEvent & {type: T}));
        }
        input.subscribe(update);
        return () => input.unsubscribe(update);
    }, [input, type, f, ...(deps ?? [])]);
}
