import {useEffect} from "react";

import {Event, EventType} from "core/utils/Events";
import {Input}            from "core/utils/Input";


export const useEvent = <T extends EventType>(type: T, f: (ev: Event & {type: T}) => void,
                                              input?: Input, deps?: React.DependencyList) => {
    useEffect(() => {
        if (!input)
            return;

        const update = (ev: Event) => {
            if (ev.type === type)
                f(ev as (Event & {type: T}));
        }
        input.addListener(update);
        return () => input.removeListener(update);
    }, [input, type, f, ...(deps ?? [])]);
}
