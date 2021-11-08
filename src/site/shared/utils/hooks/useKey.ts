import {useState} from "react";
import {useDocEvent} from "./useDocEvent";


export const useKey = (key: number) => {
    const [isKeyDown, setIsKeyDown] = useState(false);

    useDocEvent("keydown", (ev) => {
        if (ev.keyCode === key)
            setIsKeyDown(true);
    }, [setIsKeyDown, key]);
    useDocEvent("keyup", (ev) => {
        if (ev.keyCode === key)
            setIsKeyDown(false);
    }, [setIsKeyDown, key]);

    return isKeyDown;
}
