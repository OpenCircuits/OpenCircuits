import { Component } from "core/models/Component";
import { Renderer } from "core/rendering/Renderer";
import { Line } from "core/rendering/shapes/Line";
import { Style } from "core/rendering/Style";
import { DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_FILL_COLOR, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR } from "core/utils/Constants";
import { ConstantNumber } from "digital/models/ioobjects";
import { Camera } from "math/Camera";
import { Clamp, GetNearestPointOnRect } from "math/MathUtils";
import { V, Vector } from "Vector";
import { number } from "yargs";

export const ConstantNumberRenderer = (() => {

    // Function to draw the line connecting the 4 outputs
    const drawOutputConnector = function(renderer: Renderer, size: Vector, borderColor: string): void {
        const style = new Style(undefined, borderColor, DEFAULT_BORDER_WIDTH);
        // Y coordinates of the top and bottom
        const l1 = -(size.y/2)*(1.5);
        const l2 =  (size.y/2)*(1.5);
        // X coordinate to draw the vertical line
        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        // Endpoints of the line to draw
        const p1 = V(s, l1);
        const p2 = V(s, l2);
        renderer.draw(new Line(p1, p2), style);
    }

    // Function to draw the input value on the component
    const drawInputText = function(renderer: Renderer, pos0: Vector, value: number, size: Vector): void {
        let text = value < 10 ? value.toString() : 'ABCDEF'.charAt(value - 10);
        let pos = V(pos0.x,pos0.y+size.x/2);
        renderer.text(text, V(0,-25), 'center');
        // const align: CanvasTextAlign = "center";
        // const padding = 50;
        // const ww = renderer.getTextWidth(text)/2;
        // let pos = GetNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos0);
        // pos = pos.sub(pos0).normalize().scale(padding).add(pos);
        // pos.x = Clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
        // pos.y = Clamp(pos.y, -size.y/2+14, size.y/2-14);
        // renderer.text(text, pos, align);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: ConstantNumber, selected: boolean): void {
            const transform = object.getTransform();
            const fillColor = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;
            const borderColor = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
            drawOutputConnector(renderer, transform.getSize(), borderColor);
            drawInputText(renderer, object.getPos(), object.getInput(), transform.getSize());
            console.log('ConstantNumberRenderer.render()');
        }
    };
})();
