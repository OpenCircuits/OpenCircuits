import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";


import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
// import {GetAllPorts}            from "core/utils/ComponentUtils";
// import {Pressable, isPressable} from "core/utils/Pressable";

import {Renderer}                     from "../Renderer";
import {Circle}                       from "../shapes/Circle";
import {Rectangle}                    from "../shapes/Rectangle";
import {DEBUG_CULLBOX_BORDER_WIDTH, DEBUG_CULLBOX_STYLE,
        DEBUG_PRESSABLE_BOUNDS_STYLE,
        DEBUG_SELECTION_BOUNDS_STYLE} from "../Styles";


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DebugRenderer {
    export function render(renderer: Renderer, { camera, circuit, viewManager, debugOptions }: CircuitInfo): void {
        const { debugCullboxes, debugPressableBounds, debugSelectionBounds } = debugOptions;

        const objs = circuit.getObjs();

        if (debugCullboxes) {
            const cullboxes = objs.map((o) => viewManager.getView(o.id)!.getCullbox());
            renderer.save();
            renderer.transform(camera);
            for (const cullBox of cullboxes) {
                renderer.save();
                renderer.transform(cullBox);
                renderer.draw(
                    new Rectangle(
                        V(),
                        // Add extra width so that the fill perfectly fits the real bounding box
                        cullBox.getSize().add(V(DEBUG_CULLBOX_BORDER_WIDTH))
                    ),
                    DEBUG_CULLBOX_STYLE,
                    0.5
                );
                renderer.restore();
            }
            renderer.restore();
        }

        // if (debugPressableBounds) {
        //     const pressables = objects.filter((c) => isPressable(c)) as Pressable[];
        //     const cullboxes = pressables.map((p) => p.getPressableBox());
        //     renderer.save();
        //     for (const cullBox of cullboxes) {
        //         renderer.transform(camera, cullBox);
        //         renderer.draw(new Rectangle(V(), cullBox.getSize()), DEBUG_PRESSABLE_BOUNDS_STYLE, 0.5);
        //     }
        //     renderer.restore();
        // }

        // if (debugSelectionBounds) {
        //     const ports = GetAllPorts(objects);
        //     renderer.save();
        //     for (const port of ports) {
        //         const v = port.getTargetPos();
        //         renderer.transform(camera, port.getParent().getTransform());
        //         renderer.draw(new Circle(v, IO_PORT_SELECT_RADIUS), DEBUG_SELECTION_BOUNDS_STYLE, 0.5);
        //     }
        //     renderer.restore();
        // }

    }
}


// export const DebugRenderer = ({
// });
