import { Vector } from "../math/Vector";
import { Component } from "../../models/ioobjects/Component";
import { MainDesignerController } from "../../controllers/MainDesignerController";
import { IOObject } from "../../models/ioobjects/IOObject";
import * as Traits from "./Traits";

// TODO: use decorators to determine what interfaces
//

/**
 * A selection popup module is one of the "properties" that is displayed to the user (for view or sometimes editing) when an appropriate circuit component
 * I.e. AND gates have a configurable number of input nodes, all components have a name
 *
 * Under the hood, it's basically just a wrapper for an input element
 */
abstract class Module {
    protected div: HTMLDivElement;
    constructor(parent_div: HTMLDivElement) {
        this.div = parent_div;
    }

    // True makes this module visible in the selection popup menu
    // False hides this module from the selection popup menu
    set enabled(show: boolean) {
        if (show) {
            // Inherit to make sure this isn't visible when the selection popup is hidden
            this.div.style.display = "inherit";
        } else {
            this.div.style.display = "none";
        }
    }
    get enabled(): boolean {
        return (this.div.style.display == "inherit");
    }

    // Updates the module to show properties of the selected object(s)
    // Called whenever an object is selected or deselected
    // Also enables or disables the module depending on whether or not all the selected objects have the property this module needs
    abstract pull(): void;
    // Pushes changes to the current selection
    // Called whenever the associated input element changes value
    // As a consequence, this is only called when the module is enabled
    abstract push(): void;
}

class Title extends Module {
    private title: HTMLInputElement;
    constructor(parent_div: HTMLDivElement) {
        // Title module does not have a wrapping div
        super(parent_div);
        this.title = this.div.querySelector("input#popup-name");
        // oninput instead of onchange because onchange triggers when we change it
        // This way we don't have to worry about accidentally naming things <Multiple> or <None>
        this.title.oninput = this.push;
    }

    pull(): void {
        const selections = MainDesignerController.GetSelections();
        // * All IOObjects have a display name, so no property checks are required

        if (selections.length) {
            let same = true;
            let name = selections[0].getName();
            for (let i = 1; i < selections.length; ++i) {
                same = same && (name == selections[i].getName());
            }

            this.title.value = same ? name : "<Multiple>";
        }
        else {
            // When this is true, it should be hidden and not matter, but put in in just in case
            this.title.value = "<None>";
        }
    }

    push(): void {
        let selections = MainDesignerController.GetSelections();
        selections.forEach(c => c.setName(this.title.value));
    }
}

class Position extends Module {
    private xbox: HTMLInputElement;
    private ybox: HTMLInputElement;
    private static placeholder: string = "-";

    constructor(parent_div: HTMLDivElement) {
        super(parent_div.querySelector("div#popup-pos-text"));
        this.xbox = this.div.querySelector("input#popup-position-x");
        this.ybox = this.div.querySelector("input#popup-position-y");
    }

    pull(): void {
        const selections = MainDesignerController.GetSelections();
        let enable = true;

        if (selections.length) {
            let x: number = null;
            let y: number = null;

            if ("getPos" in selections[0]) {
                const pos = (selections[0] as unknown as Traits.Positionable).getPos();
                x = pos.x;
                y = pos.y;
            } else {
                enable = false;
            }

            for (let i = 1; i < selections.length && x != null && y != null; ++i) {
                if ("getPos" in selections[i]) {
                    const pos = (selections[i] as unknown as Traits.Positionable).getPos();
                    if (pos.x != x) x = null;
                    if (pos.y != y) y = null;
                } else {
                    x = y = null;
                    enable = false;
                }
            }

            if (x == null) {
                this.xbox.value = Position.placeholder;
            } else {
                this.xbox.value = x.toString();
            }
            if (y == null) {
                this.ybox.value = Position.placeholder;
            } else {
                this.ybox.value = y.toString();
            }
        } else {
            enable = false;
        }

        this.enabled = enable;
    }

    push(): void {
        let selections = MainDesignerController.GetSelections();

        selections.forEach(s => {
            // * This cast will always succeed because push is only called when the module is enabled, and it's disabled if any do not have this trait
            let trait = (s as unknown as Traits.Positionable);
            let pos = trait.getPos();

            trait.setPos(new Vector(
                this.xbox.value == Position.placeholder ? pos.x : this.xbox.valueAsNumber,
                this.xbox.value == Position.placeholder ? pos.y : this.ybox.valueAsNumber,
            ));
        });
    }
}

export {
    Module as SelectionPopupModule,
    Title as TitlePopupModule,
    Position as PositionPopupModule,
}