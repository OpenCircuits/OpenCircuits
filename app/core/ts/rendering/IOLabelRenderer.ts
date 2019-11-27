import {V, Vector} from "Vector";
import {Clamp,
        GetNearestPointOnRect} from "math/MathUtils";

import {Camera} from "math/Camera";
import {Renderer} from "core/rendering/Renderer";
import {Component} from "core/models/Component";

export const IOLabelRenderer = (() => {
    const drawPortText = function(renderer: Renderer, pos0: Vector, name: string, size: Vector): void {
        const align: CanvasTextAlign = "center";
        const padding = 8;
        const ww = renderer.getTextWidth(name)/2;

        let pos = GetNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos0);
        pos = pos.sub(pos0).normalize().scale(padding).add(pos);
        pos.x = Clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
        pos.y = Clamp(pos.y, -size.y/2+14, size.y/2-14);

        renderer.text(name, pos, align);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component): void {
            if (!camera.cull(object.getCullBox()))
                return;

            const transform = object.getTransform();
            const size: Vector = transform.getSize();

            const ports = object.getPorts();
            for (const port of ports) {
                const name = port.getName();
                const pos = port.getTargetPos();
                if (name)
                    drawPortText(renderer, pos, name, size);
            }
        }
    };
}) ();
