import {serializable} from "serialeazy";

import {Vector,V} from "Vector";

import {Port} from "core/models/ports/Port";

import {DigitalComponent, DigitalWire} from "../index";


@serializable("DigitalInputPort")
export class InputPort extends Port {
    protected parent: DigitalComponent;
    protected connections: DigitalWire[];

    /**
     * constructs the input port with no connections
     * @param parent the parent component of the port
     */
    public constructor(parent?: DigitalComponent) {
        super(parent!);
        this.parent = parent!;
        this.connections = [];
    }
    
    /**
     * activates the port and propagates the signal to all connections
     * @param signal is the signal to be propagated
     */
    public activate(signal: boolean): void {
        // Don't do anything if signal is same as current state
        if (signal === this.isOn)
            return;
        this.isOn = signal;

        // Get designer to propagate signal, exit if undefined
        const designer = this.parent.getDesigner();
        if (!designer)
            return;

        designer.propagate(this.parent, this.isOn);
    }

    /**
     * connects the input wire to the port if the wire is not already connected.
     * @param wire new input wire
     */
    public connect(wire: DigitalWire): void {
        if (this.connections.length === 1)
            throw new Error("Cannot connect to Input Port! Connection already exists!");
        this.connections = [wire];
        this.activate(wire.getIsOn());
    }
    
   /**
    * disconnects the input port from the input wire and changes the signal
    */
    public disconnect(): void {
        // remove input and propagate false signal
        this.connections = [];
        this.activate(false);
    }

    /**
     * gets the input wire of the port
     * @returns the input wire 
     */
    public getInput(): DigitalWire {
        return this.connections[0];
    }

    /**
     * gets initial direction of the input port as a vector. 
     * value is -1 because it's an input port (facing left)
     * @returns vector that represents the direction of the input port
     */
    public getInitialDir(): Vector {
        return V(-1, 0);
    }
    
    /**
     * gets the parent component of the port
     * @returns the parent component
     */
    public getParent(): DigitalComponent {
        return this.parent;
    }
    
    /**
     * gets all the wires the port is connected to
     * @returns the wire connections 
     */
    public getWires(): DigitalWire[] {
        return this.connections;
    }

}
