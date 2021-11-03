import {blend, parseColor} from "svg2canvas";

import {SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Oscilloscope} from "digital/models/ioobjects";

import {Images} from "digital/utils/Images";
import {Circle} from "core/rendering/shapes/Circle";
import {GRID_LINE_COLOR} from "core/rendering/Styles";


export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, camera: Camera, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), transform.getSize()), style);


            // Draw the signal
            renderer.save();
            renderer.setStyle(new Style(undefined, GRID_LINE_COLOR, 1.0 / camera.getZoom()));
            renderer.beginPath();

            let dx = transform.getSize().x/100;
            let x = -transform.getSize().x/2;

            for (let s = 0; s < o.getSignals().length; s++) {
                let y = o.getSignals()[s] ? -transform.getSize().y*1/3 : transform.getSize().y*1/3;

                if (s == 0)
                    renderer.moveTo(V(x, y));
                renderer.lineTo(V(x+dx, y));
                renderer.moveTo(V(x+dx, y));

                x += dx;
            }

            renderer.closePath();
            renderer.stroke();
            renderer.restore();
        }
    };
})();
