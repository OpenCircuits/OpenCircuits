import {Vector} from "Vector";

type DropHandler = (pos: Vector, ...data: any[]) => void;

export const DragDropHandlers = (() => {
    const handlers = new Map<HTMLElement, DropHandler>();

    return {
        add: (el: HTMLElement, onDrop: DropHandler) => {
            handlers.set(el, onDrop);
        },
        remove: (el: HTMLElement) => {
            handlers.delete(el);
        },
        drop: (pos: Vector, ...data: any[]) => {
            const el = document.elementFromPoint(pos.x, pos.y) as HTMLElement;
            if (handlers.has(el))
                handlers.get(el)(pos, ...data);
        }
    };
})();
