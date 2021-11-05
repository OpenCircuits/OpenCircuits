import {useEffect, useState} from "react";

import {V, Vector} from "Vector";
import {CalculateMidpoint} from "math/MathUtils";


export const useMousePos = () => {
    const [pos, setPos] = useState({
        x: undefined as number|undefined,
        y: undefined as number|undefined
    });

    useEffect(() => {
        const getTouchPositions = (touches: TouchList): Vector[] => {
            return Array.from(touches).map((t) => V(t.pageX, t.pageY));
        };

        const mouseListener = (ev: MouseEvent) => {
            setPos({ x: ev.pageX, y: ev.pageY });
        }
        const touchListener = (ev: TouchEvent) => {
            setPos(CalculateMidpoint(getTouchPositions(ev.touches)));
        }

        window.addEventListener("mousemove", mouseListener);
        window.addEventListener("touchmove", touchListener);
        return () => {
            window.removeEventListener("mousemove", mouseListener);
            window.removeEventListener("touchmove", touchListener);
        }
    }, [setPos]);

    return pos;
}
