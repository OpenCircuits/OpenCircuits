import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SEGMENT_DISPLAY_WIDTH} from "core/utils/Constants";
import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Rectangle} from "core/rendering/shapes/Rectangle";
import {Style} from "core/rendering/Style";

import {BCDDisplay} from "digital/models/ioobjects/outputs/BCDDisplay";

import {Images} from "digital/utils/Images";
import {Line} from "core/rendering/shapes/Line";

export const BCDDisplayRenderer = (() => {
   
    return {
        render(renderer: Renderer, _: Camera, display: BCDDisplay, selected: boolean): void {
            const transform = display.getTransform();

            const size = transform.getSize();

            // Draw background
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), size), style);

            const p1 = display.getPorts()[0].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            const p2 = display.getPorts()[display.getPorts().length-1].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            renderer.draw(new Line(p1, p2), style);   
            
            //Converting Binary Number to Decimal
            const inputNum = display.getInputPortCount().getValue();
            let binToDec = 0;
            for (let i = 0; i < inputNum; i++){
                const on = display.getInputPort(i).getIsOn();
                //Flips the order of the inputs so they are in top down order
                const power = Math.abs(i - (inputNum - 1))
                if (on){
                    binToDec += 2**power;
                }
                else{ 
                    continue;
                }
            }

            // Draw lights
            const segments = display.getSegments();
            //accesses array of indicies that correlates to the indicies in the Segments.json
            const segmentsIndicies = display.getBCDFont(binToDec);
            for (let i = segmentsIndicies.length - 1; i >= 0 ; i--) {
                const pos = segments[segmentsIndicies[i]][0].scale(V(SEGMENT_DISPLAY_WIDTH));
                const type = segments[segmentsIndicies[i]][1];
                //input is always true, the indicies are set for each number configuration
                const on  = true;

                const col = (on ? DEFAULT_ON_COLOR : (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR));

                const img = Images.GetImage(`segment_${type}.svg`);
                const size = V(img.width, img.height).scale(0.1);
                renderer.image(img, pos, size, col);
            }

        }
    };
})();
