import {useEffect, useState} from "react";


export const useMousePos = () => {
    const [pos, setPos] = useState({
        x: 0 as number,
        y: 0 as number,
    });

    useEffect(() => {
        // const getTouchPositions = (touches: TouchList): Vector[] => {
        //     return Array.from(touches).map((t) => V(t.pageX, t.pageY));
        // };

        const mouseListener = (ev: PointerEvent) => {
            setPos({ x: ev.pageX, y: ev.pageY });
        }
        // const touchListener = (ev: TouchEvent) => {
        //     setPos(CalculateMidpoint(getTouchPositions(ev.touches)));
        // }

        window.addEventListener("pointermove", mouseListener);
        return () => {
            window.removeEventListener("pointermove", mouseListener);
        }
    }, [setPos]);

    return pos;
}
