import {Clamp} from "math/MathUtils";

import {SelectionPopupModule} from "./SelectionPopupModule";

export abstract class NumberInputPopupModule extends SelectionPopupModule {
    protected count: HTMLInputElement;
    protected previousCount = NaN;

    /**
     * Sanitizes and clamps the user number input,
     *  updates the displayed number if needed
     * @return The cleaned input if the user entered a number,
     *          NaN if the new and previous count are both NaN
     */
    public getInput(): number {
        let countAsNumber = this.count.valueAsNumber || this.previousCount;

        if (isNaN(countAsNumber)) {
            this.count.value = "-";
            return NaN;
        }

        countAsNumber = Clamp(Math.round(countAsNumber), parseInt(this.count.min), parseInt(this.count.max));
        this.count.value = countAsNumber.toString();
        this.previousCount = countAsNumber;
        return countAsNumber;
    }

    public push(): void {
        const input = this.getInput();
        if (!isNaN(input)) {
            this.executeChangeAction(input);
            this.circuitController.render();
        }
    }

    /**
     * Creates and executes the appropriate PortChangeAction
     *  according to the type of component(s) selected
     * @param newCount The sanitized user-specified target number
     *                  of ports, should never be NaN
     */
    public abstract executeChangeAction(newCount: number): void;
}