import {Clamp} from "math/MathUtils";

import {SelectionPopupModule} from "./SelectionPopupModule";

export abstract class NumberInputPopupModule extends SelectionPopupModule {
    protected count: HTMLInputElement;
    protected previousCount: number;

    /**
     * Gets the sanitized and clamped user number input
     * @return The cleaned input if the user entered a number,
     *          NaN if the new and previous count are both NaN
     */
    private getInput(): number {
        const countAsNumber = this.count.valueAsNumber || this.previousCount;
        if (isNaN(countAsNumber))
            return NaN;

        return Clamp(Math.round(countAsNumber), parseInt(this.count.min), parseInt(this.count.max));
    }

    public push(): void {
        const input = this.getInput();

        if (isNaN(input)) {
            this.count.value = "-";
            return;
        }

        this.count.value = input.toString();
        this.previousCount = input;

        this.executeChangeAction(input);
        this.circuitController.render();
    }

    /**
     * Creates and executes the appropriate PortChangeAction
     *  according to the type of component(s) selected
     * @param newCount The sanitized user-specified target number
     *                  of ports, should never be NaN
     */
    public abstract executeChangeAction(newCount: number): void;
}