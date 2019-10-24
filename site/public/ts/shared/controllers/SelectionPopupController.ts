import $ from "jquery";

import {Vector, V} from "Vector";

import {MainDesignerController} from "./MainDesignerController";
import {Component} from "core/models/Component";
import {Wire} from "core/models/Wire";
import {Port} from "core/models/ports/Port";

import {SelectionPopupModule} from "../selectionpopup/SelectionPopupModule";

/**
* A popup that exposes certain properties of the selected components to the user
* ! Controls its own DOM element(s)
* TODO: use decorators or some other interface to determine what properties are available
*/
export class SelectionPopupController {
    private main: MainDesignerController;

    private div: JQuery<HTMLDivElement>;

    private modules: SelectionPopupModule[];

    private pos: Vector;

    public constructor(main: MainDesignerController, divId: string = "#selection-popup") {
        this.main = main;

        this.div = $(divId);
        // ? .js sets position to "absolute" -- why? Why not set in the css file

        this.modules = [];

        this.pos = V();

        this.hide();
    }

    private setPos(v: Vector): void {
        this.pos = v;

        this.div.css("left", `${this.pos.x}px`);
        this.div.css("top",  `${this.pos.y}px`);
    }

    public addModules(...modules: SelectionPopupModule[]): void {
        this.modules = this.modules.concat(modules);
    }

    public update(): void {
        const selections = this.main.getSelections();
        const camera = this.main.getCamera();

        if (selections.length > 0) {
            // Update each module
            // Important to do this before repositioning the popup, since its size changes depending on which modules are active
            this.modules.forEach(c => c.pull());

            // Update the position of the popup
            const positions = selections.map((o) => {
                if (o instanceof Component)
                    return o.getPos();
                else if (o instanceof Wire)
                    return o.getShape().getPos(0.5);
                else if (o instanceof Port)
                    return o.getWorldTargetPos();
            });
            const sum = positions.reduce((acc, pos) => acc.add(pos), V(0, 0));
            const screenPos = camera.getScreenPos(sum.scale(1/positions.length)).sub(0, this.div[0].clientHeight/2);

            // TODO: clamp should make sure not to overlap with other screen elements
            //const lo = new Vector(0);
            //const hi = new Vector(document.body.clientWidth, document.body.clientHeight);

            this.setPos(screenPos);// Vector.clamp(screen_pos, lo, hi);

            this.show();
        } else {
            this.hide();
        }
    }

    public show(): void {
        this.div.removeClass("invisible")
        this.div.focus();
    }

    public hide(): void {
        this.div.addClass("invisible");
    }
}
