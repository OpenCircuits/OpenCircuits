import {serializable} from "serialeazy";

import {V, Vector} from "Vector";

import {Port} from "core/models/ports/Port";

import {DigitalComponent, DigitalWire} from "../index";


@serializable("DigitalInputPort")
export class InputPort extends Port {
    protected override parent: DigitalComponent;
    protected override connections: DigitalWire[];

    /**
     * Constructs the input port with no connections.
     *
     * @param parent The parent component of the port.
     */
    public constructor(parent?: DigitalComponent) {
        super(parent!);
        this.parent = parent!;
        this.connections = [];
    }

    /**
     * Activates the port and propagates the signal to all connections.
     *
     * @param signal The signal to be propagated.
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
     * Connects the input wire to the port if the wire is not already connected.
     *
     * @param wire The new input wire.
     * @throws Error if the there is already a wire connected to this port.
     */
    public connect(wire: DigitalWire): void {
        if (this.connections.length === 1)
            throw new Error("Cannot connect to Input Port! Connection already exists!");
        this.connections = [wire];
        this.activate(wire.getIsOn());
    }

    /**
     * Disconnects the input port from the input wire and changes the signal.
     */
    public disconnect(): void {
        // remove input and propagate false signal
        this.connections = [];
        this.activate(false);
    }

    /**
     * Gets the input wire of the port.
     *
     * @returns The input wire.
     */
    public getInput(): DigitalWire {
        return this.connections[0];
    }

    /**
     * Gets initial direction of the input port as a vector.
     * Value is -1 because it's an input port (facing left).
     *
     * @returns A vector that represents the direction of the input port.
     */
    public getInitialDir(): Vector {
        return V(-1, 0);
    }

    /**
     * Gets the parent component of the port.
     *
     * @returns The parent component.
     */
    public override getParent(): DigitalComponent {
        return this.parent;
    }

    /**
     * Gets all the wires the port is connected to.
     *
     * @returns The wire connections.
     */
    public override getWires(): DigitalWire[] {
        return this.connections;
    }

}
