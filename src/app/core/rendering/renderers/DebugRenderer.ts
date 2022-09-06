import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";


import {V} from "Vector";

import {CircuitInfo}            from "core/utils/CircuitInfo";
import {GetAllPorts}            from "core/utils/ComponentUtils";
import {Pressable, isPressable} from "core/utils/Pressable";

import {Renderer}                     from "../Renderer";
import {Circle}                       from "../shapes/Circle";
import {Rectangle}                    from "../shapes/Rectangle";
import {DEBUG_CULLBOX_STYLE,
        DEBUG_PRESSABLE_BOUNDS_STYLE,
        DEBUG_SELECTION_BOUNDS_STYLE} from "../Styles";


export const DebugRenderer = ({
    render(renderer: Renderer, info: CircuitInfo): void {
        const { camera, designer } = info;

        const objects = designer.getObjects();
        const wires = designer.getWires();


        if (info.debugOptions.debugCullboxes) {
            const cullboxes = [...objects, ...wires].map((c) => c.getCullBox());
            renderer.save();
            for (const cullBox of cullboxes) {
                renderer.transform(camera, cullBox);
                renderer.draw(new Rectangle(V(), cullBox.getSize()), DEBUG_CULLBOX_STYLE, 0.5);
            }
            renderer.restore();
        }

        if (info.debugOptions.debugPressableBounds) {
            const pressables = objects.filter((c) => isPressable(c)) as Pressable[];
            const cullboxes = pressables.map((p) => p.getPressableBox());
            renderer.save();
            for (const cullBox of cullboxes) {
                renderer.transform(camera, cullBox);
                renderer.draw(new Rectangle(V(), cullBox.getSize()), DEBUG_PRESSABLE_BOUNDS_STYLE, 0.5);
            }
            renderer.restore();
        }

        if (info.debugOptions.debugSelectionBounds) {
            const ports = GetAllPorts(objects);
            renderer.save();
            for (const port of ports) {
                const v = port.getTargetPos();
                renderer.transform(camera, port.getParent().getTransform());
                renderer.draw(new Circle(v, IO_PORT_SELECT_RADIUS), DEBUG_SELECTION_BOUNDS_STYLE, 0.5);
            }
            renderer.restore();
        }

    },
});
