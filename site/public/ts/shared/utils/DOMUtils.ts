import {V} from "Vector";
import {Transform} from "math/Transform";

export function DOMRectToTransform(rect: DOMRect | ClientRect): Transform {
    const size = V(rect.width, rect.height);
    const pos = V(rect.left, rect.top).add(size.scale(0.5));
    return new Transform(pos, size);
}