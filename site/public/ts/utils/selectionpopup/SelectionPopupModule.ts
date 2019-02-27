/**
* A selection popup module is one of the "properties" that is displayed to the user (for view or sometimes editing) when an appropriate circuit component
* I.e. AND gates have a configurable number of input nodes, all components have a name and position
*
* Under the hood, it's basically just a wrapper for an input element and surrounding div
* TODO: Do I even need a div?
*/
export abstract class SelectionPopupModule {
    protected div: HTMLDivElement;

    public constructor(parent_div: HTMLDivElement) {
        this.div = parent_div;
    }

    // True makes this module visible in the selection popup menu
    // False hides this module from the selection popup menu
    public setEnabled(show: boolean): void {
        // Inherit to make sure this isn't visible when the selection popup is hidden
        this.div.style.display = (show ? "inherit" : "none");
    }

    public getEnabled(): boolean {
        return (this.div.style.display == "inherit");
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
