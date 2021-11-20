import {useEffect, useState} from "react";


export const usePageVisibility = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const listener = () => {
            setIsVisible(!document.hidden);
        }

        document.addEventListener("visibilitychange", listener);

        return () => document.removeEventListener("visibilitychange", listener);
    }, [setIsVisible]);

    return isVisible;
}
