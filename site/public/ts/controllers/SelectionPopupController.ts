import { Vector } from "../utils/math/Vector";
import * as Modules from "../utils/selectionpopup/SelectionPopupModules";
import { MainDesignerController } from "./MainDesignerController";
import * as Traits from "../utils/selectionpopup/Traits";

/**
 * A popup
 * ! Controls its own DOM element
 */
export class SelectionPopupController {
    private div: HTMLDivElement;
    private modules: Array<Modules.SelectionPopupModule>;
    private pos: Vector;

    constructor(div_id: string = "popup") {
        this.div = <HTMLDivElement> document.getElementById(div_id);
        // ? .js sets position to "absolute" -- why? Why not set in the css file

        this.modules = new Array<Modules.SelectionPopupModule>(
            new Modules.TitlePopupModule(this.div),
            new Modules.PositionPopupModule(this.div),
        );
        this.pos = new Vector(0, 0);
    }

    set position(v: Vector) {
        this.pos = v; // TODO: clamp v to window (makes sure it's not on top of the sidebar, for example)

        this.div.style.left = `${this.pos.x}px`;
        this.div.style.top = `${this.pos.y}px`;
    }

    get position(): Vector {
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
                if ("getPos" in selections[i]) {
                    const pos = (selections[i] as unknown as Traits.Positionable).getPos();
                    sum = sum.add(pos);
                    count += 1;
                }
            }
            let screen_pos = MainDesignerController.CanvasToScreen(sum.scale(1/count));
            //console.log(this.div.clientHeight, document.body.clientHeight);
            screen_pos.y = screen_pos.y - (this.div.clientHeight/2);
            // TODO: clamp should make sure not to overlap with other screen elements
            //const lo = new Vector(0);
            //const hi = new Vector(document.body.clientWidth, document.body.clientHeight);
            this.position = screen_pos;// Vector.clamp(screen_pos, lo, hi);


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