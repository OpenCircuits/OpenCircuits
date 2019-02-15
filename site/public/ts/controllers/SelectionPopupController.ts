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

    show() {
        const selections = MainDesignerController.GetSelections();
        let sum = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < selections.length; ++i) {
            if ("getPos" in selections[0]) {
                const pos = (selections[0] as unknown as Traits.Positionable).getPos();
                sum = sum.add(pos);
                count += 1;
            }
        }
        this.position = sum.scale(1/count);

        this.div.style.visibility = "visible";
        this.div.focus();
    }

    hide() {
        this.div.style.visibility = "hidden";
    }

    onSelectionChanged() {
        console.log(MainDesignerController.GetSelections());
        if (MainDesignerController.GetSelections().length) {
            this.show();
            this.modules.forEach(c => c.pull()); // Update each module with current information
        } else {
            this.hide();
        }
    }
}