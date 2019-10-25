import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

/**
* A selection popup module is one of the "properties" that is displayed to the user (for view or sometimes editing) when an appropriate circuit component
* I.e. AND gates have a configurable number of input nodes, all components have a name and position
*
* Under the hood, it's basically just a wrapper for an input element and surrounding el
* TODO: Do I even need a el?
*/
export abstract class SelectionPopupModule {
    protected circuitController: MainDesignerController;

    protected el: JQuery<HTMLElement>;

    public constructor(circuitController: MainDesignerController, parentel: JQuery<HTMLElement>) {
        this.circuitController = circuitController;
        this.el = parentel;
    }

    public setEnabled(show: boolean): void {
        // If we are enabled and should hide then toggle or
        //  if we aren't enabled and should show then toggle
        if (this.isEnabled() !== show)
            this.el.toggleClass("hide");
    }

    public isEnabled(): boolean {
        return (!this.el.hasClass("hide"));
    }

    // Updates the module to show properties of the selected object(s)
    // Called whenever an object is selected or deselected
    // Also enables or disables the module depending on whether or not all the selected objects have the property this module needs
    public abstract pull(): void;

    // Pushes changes to the current selection
    // Called whenever the associated input element changes value
    // As a consequence, this is only called when the module is enabled
    public abstract push(): void;
}
