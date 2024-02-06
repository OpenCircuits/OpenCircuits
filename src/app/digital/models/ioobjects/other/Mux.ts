import {serialize} from "serialeazy";

import {MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Component, Port} from "core/models";

import {PortSet} from "core/models/ports/PortSets";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {DigitalComponent, DigitalWire} from "digital/models";

import {InputPort}  from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


const MUX_DEFAULT_SELECT_PORTS = 2;

export abstract class Mux extends DigitalComponent {
    @serialize
    protected selects: PortSet<InputPort>;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue,
                        selectPositioner: Positioner<InputPort>,
                        inputPositioner?: Positioner<InputPort>,
                        outputPositioner?: Positioner<OutputPort>) {
        super(inputPortCount, outputPortCount, Mux.CalcSize(MUX_DEFAULT_SELECT_PORTS),
              inputPositioner, outputPositioner);

        this.selects = new PortSet<InputPort>(
            this, new ClampedValue(MUX_DEFAULT_SELECT_PORTS, 1, 8),
            selectPositioner, InputPort as new (c: Component) => InputPort
        );

        this.setSelectPortCount(MUX_DEFAULT_SELECT_PORTS);
    }

    protected updatePortNames(): void {
        this.selects.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`S${i}`);
        });
    }

    public override setInputPortCount(val: number): void {
        super.setInputPortCount(val);
        this.updatePortNames();
    }

    public override setOutputPortCount(val: number): void {
        super.setOutputPortCount(val);
        this.updatePortNames();
    }

    public setSelectPortCount(val: number): void {
        // Update size (before setting ports since their positions are based on the size)
        this.setSize(Mux.CalcSize(val));

        this.selects.setPortCount(val);

        // Update input port positions and port names
        this.inputs.updatePortPositions();
        this.outputs.updatePortPositions();
        this.updatePortNames();
    }

    public getSelectPorts(): InputPort[] {
        return this.selects.getPorts();
    }

    public getSelectPortCount(): ClampedValue {
        return this.selects.getCount();
    }

    public numSelects(): number {
        return this.selects.length;
    }

    // @Override
    public override getOffset(): Vector {
        return super.getOffset().add(0, MULTIPLEXER_HEIGHT_OFFSET/2);
    }

    // @Override
    public override getInputs(): DigitalWire[] {
        // Get each wire connected to each InputPort
        //  and then filter out the null ones
        return [
            ...super.getInputs(),
            ...this.getSelectPorts()
                .map((p) => p.getInput())
                .filter((w) => !!w),
        ];
    }

    // @Override
    public override getPorts(): Port[] {
        return [...super.getPorts(), ...this.getSelectPorts()];
    }

    /**
     * Calculates the size for a Mux with a number of selectors.
     *
     * @param ports Number of selectors.
     * @returns       A Vector of the size for a Mux.
     */
    public static CalcSize(ports: number): Vector {
        return V((0.5 + ports/2), (1 + Math.pow(2, ports - 1)));
    }
}
