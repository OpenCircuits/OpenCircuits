import {IO_PORT_LENGTH, IO_PORT_SELECT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircleContains} from "math/MathUtils";

import {Selectable} from "core/utils/Selectable";

import {Component} from "core/models/Component";
import {Wire}      from "core/models/Wire";


/**
 * Represents a port.
 * Ports are attached to a parent component.
 * They take an input or output signal.
 */
export abstract class Port implements Selectable {
    /**
     * The parent Component of the port.
     */
    protected parent: Component;
    /**
     *
     */
    protected isOn: boolean;
    /**
     * Name of the port.
     */
    protected name: string;
    /**
     * Direction of the ports relative to the parent component.
     */
    protected dir: Vector;
    /**
     * A vector representing the position where the port attaches to the parent component relative to the
     * parent component.
     */
    protected origin: Vector;
    /**
     * A vector representing the position of the port relative to the parent component relative to the
     * parent component.
     */
    protected target: Vector;
    /**
     * An array containing the Wires attached to this port.
     */
    protected connections: Wire[];

    /**
     * Intializes a Port with the following parameters.
     *
     * @param parent Parent component of the port.
     * @param dir    Direction of the of the port relative to the parent component.
     */
    protected constructor(parent: Component, dir?: Vector) {
        this.parent = parent;
        this.isOn = false;

        this.name = "";

        this.dir = dir || this.getInitialDir();
        this.origin = V(0, 0);
        this.target = this.dir.scale(IO_PORT_LENGTH);

        this.connections = [];
    }

    /**
     * Updates the direction of the of the port relative to the parent component.
     */
    private updateDir(): void {
        // If target and origin are same, don't update dir
        if (this.target.sub(this.origin).len2() === 0)
            return;

        this.dir = this.target.sub(this.origin).normalize();
    }

    /**
     * Sets the name of the port to a given string.
     *
     * @param name String to set `this.name` to.
     */
    public setName(name: string): void {
        this.name = name;
    }

    /**
     * Changes the position of where the port attaches to the parent component relative to the parent component.
     *
     * @param pos Vector representing the position to change it to.
     */
    public setOriginPos(pos: Vector): void {
        this.origin = pos;
        this.updateDir();
    }

    /**
     * Changes the position of where the port is on the canvas relative to the parent component.
     *
     * @param pos Vector representing the position to change it to.
     */
    public setTargetPos(pos: Vector): void {
        this.target = pos;
        this.updateDir();
    }

    /**
     * Connects a wire to a port.
     * Left as abstract since we expect different behaviour for analog and digital ports.
     *
     * @param w Wire to connect.
     */
    public abstract connect(w: Wire): void;

    /**
     * Disconnects a wire from a port.
     * Left as abstract since we expect different behaviour for analog and digital ports.
     *
     * @param w Wire to disconnect.
     */
    public abstract disconnect(w: Wire): void;

    /**
     * When clicking on a port returns true if the position clicked is within the selection bound and false otherwise.
     *
     * @param v Vector representing the position clicked.
     * @returns   True if the vector v is within the selection bound of the port and false otherwise.
     */
    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, v);
    }

    /**
     * Finds index of this port in the parent's array of ports.
     *
     * @returns The index of this port in the parent component's array of ports.
     */
    public getIndex(): number {
        return this.parent.getPorts().indexOf(this);
    }

    /**
     * Returns the parent Component of this port.
     *
     * @returns The parent Component.
     */
    public getParent(): Component {
        return this.parent;
    }

    /**
     * Returns whether or not the port is on.
     *
     * @returns True if `this.isOn` is true and false otherwise.
     */
    public getIsOn(): boolean {
        return this.isOn;
    }

    /**
     * Return the name of this port.
     *
     * @returns The string value of `this.name`.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the intial direction of a port represented as a Vector.
     * Left as abstract since ports will have a different intial direction depending on their parent component
     * and whether they serve as input or output ports.
     */
    public abstract getInitialDir(): Vector;


     /**
      * Returns the direction of the port relative to the parent component.
      *
      * @returns A vector representing the direction of the port relative to the parent component.
      */
    public getDir(): Vector {
        return this.dir.copy();
    }

    /**
     * Returns the position of where the port attaches to the parent component relative to the parent component.
     *
     * @returns A copy of `this.origin`.
     */
    public getOriginPos(): Vector {
        return this.origin.copy();
    }

     /**
      * Returns the position of where the port is on the canvas relative to the parent component.
      *
      * @returns A copy of `this.target`.
      */
    public getTargetPos(): Vector {
        return this.target.copy();
    }

    /**
     * Returns the direction of the port.
     *
     * @returns A vector representing the direction of the port.
     */
    public getWorldDir(): Vector {
        return this.parent.getTransform().toWorldSpace(this.dir).sub(this.parent.getPos()).normalize();
    }

     /**
      * Returns the position of where the port attaches to the parent component.
      *
      * @returns A vector representing the position where the port attaches to the parent component.
      */
    public getWorldOriginPos(): Vector {
        return this.parent.getTransform().toWorldSpace(this.origin);
    }

    /**
     * Returns the position of where the port is on the canvas.
     *
     * @returns A vector representing the position of the port.
     */
    public getWorldTargetPos(): Vector {
        return this.parent.getTransform().toWorldSpace(this.target);
    }

    /**
     * Returns the position of where the port is on the canvas relative to the parent component.
     *
     * @returns A vector representing the position of the port relative to the parent component.
     */
    public getPos(): Vector {
        return this.getTargetPos();
    }

    /**
     * Returns an array that contains the Wires connected to the port.
     *
     * @returns The wires connected to this Port.
     */
    public getWires(): Wire[] {
        return this.connections;
    }
}
