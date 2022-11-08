import {useEffect} from "react";

import {InputManager, InputManagerEvent, InputManagerEventType} from "core/utils/InputManager";


export const useEvent = <T extends InputManagerEventType>(type: T, f: (ev: InputManagerEvent & {type: T}) => void,
                                              input?: InputManager, deps?: React.DependencyList) => {
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
