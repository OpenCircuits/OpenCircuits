import {useEffect, useState} from "react";


export const useMousePos = () => {
    const [pos, setPos] = useState({
        x: undefined as number|undefined,
        y: undefined as number|undefined
    });

    useEffect(() => {
        const listener = (ev: MouseEvent) => {
            setPos({
                x: ev.pageX,
                y: ev.pageY,
            });
        }

        window.addEventListener("mousemove", listener);
        return () => window.removeEventListener("mousemove", listener);
    }, [setPos]);

    return pos;
}
