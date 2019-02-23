import {Vector} from "../utils/math/Vector";
import {MainDesignerController} from "./MainDesignerController";
import {Component} from "../models/ioobjects/Component";
import {Camera} from "../utils/Camera";
import {SelectionPopupModule} from "../utils/selectionpopup/SelectionPopupModule";
import {TitlePopupModule} from "../utils/selectionpopup/TitlePopupModule";
import {PositionPopupModule} from "../utils/selectionpopup/PositionPopupModule";

/**
 * A popup that exposes certain properties of the selected components to the user
 * ! Controls its own DOM element(s)
 * TODO: use decorators or some other interface to determine what properties are available
 */
class SelectionPopupController {
    private camera: Camera;
    private div: HTMLDivElement;
    private modules: Array<SelectionPopupModule>;
    private pos: Vector;

    constructor(camera: Camera, div_id: string = "popup") {
        this.camera = camera;

        this.div = document.getElementById(div_id) as HTMLDivElement;
        // ? .js sets position to "absolute" -- why? Why not set in the css file

        this.modules = new Array<SelectionPopupModule>(
            new TitlePopupModule(this.div),
            new PositionPopupModule(this.div),
        );
        this.pos = new Vector(0, 0);
    }

    setPos(v: Vector) {
        this.pos = v;

        this.div.style.left = `${this.pos.x}px`;
        this.div.style.top = `${this.pos.y}px`;
    }

    getPos(): Vector {
        return this.pos;
    }

    update() {
        if (MainDesignerController.GetSelections().length) {
            // Update each module
            // Important to do this before repositioning the popup, since its size changes depending on which modules are active
            this.modules.forEach(c => c.pull());

            // Update the position of the popup
            const selections = MainDesignerController.GetSelections();
            let sum = new Vector(0, 0);
            let count = 0;
            for (let i = 0; i < selections.length; ++i) {
                const s = selections[i];
                if (s instanceof Component) { // Only components have positions
                    const pos = s.getPos();
                    sum = sum.add(pos);
                    count += 1;
                }
            }
            let screen_pos = this.camera.getScreenPos(sum.scale(1/count));
            //console.log(this.div.clientHeight, document.body.clientHeight);
            screen_pos.y = screen_pos.y - (this.div.clientHeight/2);
            // TODO: clamp should make sure not to overlap with other screen elements
            //const lo = new Vector(0);
            //const hi = new Vector(document.body.clientWidth, document.body.clientHeight);
            this.setPos(screen_pos);// Vector.clamp(screen_pos, lo, hi);

            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        this.div.style.visibility = "visible";
        this.div.focus();
    }

    hide() {
        this.div.style.visibility = "hidden";
    }
}

namespace Singleton {
    // readonly doesn't work in namespaces :(
    let popup: SelectionPopupController;


    export function Init(camera: Camera) {
        console.assert(popup === undefined);
        popup = new SelectionPopupController(camera);
    }
    export function Update() {
        popup.update();
    }
    export function Show() {
        popup.show();
    }
    export function Hide() {
        popup.hide();
    }
}

export {
    Singleton as SelectionPopupController
}