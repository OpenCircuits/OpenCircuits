import {useState} from "react";

import {Key} from "core/utils/Key";

import {useDocEvent} from "./useDocEvent";


export const useKey = (key: Key) => {
    const [isKeyDown, setIsKeyDown] = useState(false);

    useDocEvent("keydown", (ev) => {
        if (ev.key === key)
            setIsKeyDown(true);
    }, [setIsKeyDown, key]);
    useDocEvent("keyup", (ev) => {
        if (ev.key === key)
            setIsKeyDown(false);
    }, [setIsKeyDown, key]);

    return isKeyDown;
}
