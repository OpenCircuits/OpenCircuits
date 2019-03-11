import {Renderer} from "../Renderer";
import {Component} from "../../../models/ioobjects/Component";
import {Camera} from "../../Camera";
import {GetNearestPointOnRect} from "../../math/MathUtils";
import {V, Vector} from "../../math/Vector";
import {Clamp} from "../../math/MathUtils";

export var IOLabelRenderer = (function() {

    let portArithmetic = function(renderer: Renderer, pos0: Vector, name: string, size: Vector): void {
        let align: CanvasTextAlign = "center";
        let padding = 8;
        let ww = renderer.getTextWidth(name)/2;
        let pos: Vector = GetNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), pos0);
        pos = pos.sub(pos0).normalize().scale(padding).add(pos);
        pos.x = Clamp(pos.x, -size.x/2+padding+ww, size.x/2-padding-ww);
        pos.y = Clamp(pos.y, -size.y/2+14, size.y/2-14);
        renderer.text(name, pos.x, pos.y, align);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component) {
            if (!camera.cull(object.getCullBox()))
                return;

            let transform = object.getTransform();
            let size: Vector = transform.getSize();

            for (let i = 0; i < object.getInputPortCount(); i++){
                let name = object.getInputPort(i).getName();
                let pos0: Vector = object.getInputPort(i).getTargetPos();
                if (name)
                    portArithmetic(renderer, pos0, name, size);
            }

            for (let i = 0; i < object.getOutputPortCount(); i++){
                let name = object.getOutputPort(i).getName();
                let pos0: Vector = object.getOutputPort(i).getTargetPos();
                if (name)
                    portArithmetic(renderer, pos0, name, size);
            }
        }
    };


}) ();
