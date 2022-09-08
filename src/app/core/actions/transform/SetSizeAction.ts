import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";


/**
 * Implementation of Action interface for setting component sizes.
 */
export class SetSizeAction implements Action {

    /**
     * The selected component.
     */
    private readonly obj: Component;

    /**
     * The initial size of the selected component.
     */
    private readonly initialSize: Vector;

    /**
     * The final size the selected component.
     */
    private readonly targetSize: Vector;

    /**
     * Creates a set size action for a component.
     *
     * @param obj        The component to set the size of.
     * @param targetSize The target size for the component.
     */
    public constructor(obj: Component, targetSize: Vector) {
        this.obj = obj;
        this.initialSize = obj.getSize();
        this.targetSize = targetSize;

        this.execute();
    }

    /**
     * Sets the components size to the target.
     *
     * @returns This action (for chaining).
     */
    public execute(): Action {
        this.obj.setSize(this.targetSize);

        return this;
    }

    /**
     * Reverts the action and sets the component's size back to the initial size.
     *
     * @returns This action (for chaining).
     */
    public undo(): Action {
        this.obj.setSize(this.initialSize);

        return this;
    }

    public getName(): string {
        return "Resize";
    }

    public getCustomInfo(): string[] {
        const v0x = Math.round(this.initialSize.x), v0y = Math.round(this.initialSize.y);
        const v1x = Math.round(this.targetSize.x), v1y = Math.round(this.targetSize.y);
        return [`${this.obj.getName()}: resized from (${v0x}, ${v0y}) to (${v1x}, ${v1y})`];
    }
}
