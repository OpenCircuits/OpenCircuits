import {Vector} from "../utils/math/Vector";

import {ICData} from "../models/ioobjects/other/ICData";

import {MainDesignerController} from "./MainDesignerController";
import {Component} from "../models/ioobjects/Component";
import {Camera} from "../utils/Camera";

import {SelectionPopupModule} from "../utils/selectionpopup/SelectionPopupModule";
import {TitlePopupModule} from "../utils/selectionpopup/TitlePopupModule";
import {PositionPopupModule} from "../utils/selectionpopup/PositionPopupModule";
import {ICButtonPopupModule} from "../utils/selectionpopup/ICButtonPopupModule";
import {ColorPopupModule} from "../utils/selectionpopup/ColorPopupModule";

/**
* A popup that exposes certain properties of the selected components to the user
* ! Controls its own DOM element(s)
* TODO: use decorators or some other interface to determine what properties are available
*/
export var SelectionPopupController = (function() {
    let camera: Camera;
    let div: HTMLDivElement;
    let modules: Array<SelectionPopupModule>;
    let pos: Vector;

    let setPos = function(v: Vector): void {
        pos = v;

        div.style.left = `${pos.x}px`;
        div.style.top  = `${pos.y}px`;
    }

    return {
        Init: function(cam: Camera, div_id: string = "popup"): void {
            camera = cam;

            div = document.getElementById(div_id) as HTMLDivElement;
            // ? .js sets position to "absolute" -- why? Why not set in the css file

            modules = new Array<SelectionPopupModule>(
                new TitlePopupModule(div),
                new PositionPopupModule(div),
                new ColorPopupModule(div),
                new ICButtonPopupModule(div)
            );
            pos = new Vector(0, 0);
        },
        Update: function(): void {
            const selections = MainDesignerController.GetSelections();

            if (selections.length > 0) {
                // Update each module
                // Important to do this before repositioning the popup, since its size changes depending on which modules are active
                modules.forEach(c => c.pull());

                // Update the position of the popup
                let components = selections.filter(s => s instanceof Component).map(c => c as Component);
                let sum = components.reduce((acc, c) => acc.add(c.getPos()), new Vector(0, 0));
                let screen_pos = camera.getScreenPos(sum.scale(1/components.length));
                //console.log(this.div.clientHeight, document.body.clientHeight);
                screen_pos.y = screen_pos.y - (div.clientHeight/2);
                // TODO: clamp should make sure not to overlap with other screen elements
                //const lo = new Vector(0);
                //const hi = new Vector(document.body.clientWidth, document.body.clientHeight);
                setPos(screen_pos);// Vector.clamp(screen_pos, lo, hi);

                this.Show();
            } else {
                this.Hide();
            }
        },
        Show: function(): void {
            div.style.visibility = "visible";
            div.focus();
        },
        Hide: function(): void {
            div.style.visibility = "hidden";
        }
    };
})();
